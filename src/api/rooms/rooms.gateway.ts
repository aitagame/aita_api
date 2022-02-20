import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { createHash } from "crypto";
import { RoomEssentialDto } from "./dto/roomEssential.dto";
import { ROOMS_LIST, ROOMS_LEAVE, ROOMS_JOIN, ROOMS_GET, ROOMS_GET_ID, ROOMS_CREATE, ROOMS_STATE_LOBBY, ROOMS_USER_STATE_ONLINE, ROOMS_STATE_INGAME, MAX_PASSWORD_LENGTH, ROOMS_MODE_DEATHMATCH, ROOMS_MODE_TEAM, ROOMS_MODE_CTF, ROOMS_MODE_CTP, ROOMS_TYPES, MAX_ROOM_NAME_LENGTH, MIN_ROOM_NAME_LENGTH, ROOM_NAME_REGEX } from "./consts";
import { RoomDto } from "./dto/room.dto";
import { WsGuard } from "../users/guards/ws.gurard";
import { ConflictException, Controller, UseGuards } from "@nestjs/common";
import { RedisService } from "src/storage/redis/redis.service";
import { UserModule } from "../users/user.module";
import { UserService } from "../users/user.service";
import { User } from "../users/user.model";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
@UseGuards(WsGuard)
export class RoomsEventsGateway {
    server: Server;
    private users: Map<number, User>;

    constructor(
        private redisService: RedisService,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    @SubscribeMessage(ROOMS_LIST)
    async list(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<Array<RoomEssentialDto>>> {
        const roomsKeys = await this.redisService.keys('room[0-9]*');

        let roomsList = await Promise.all(roomsKeys.map(async (roomKey) => {
            let roomId = roomKey.split('room').pop();
            let passHash = await this.redisService.hGet(`room${roomId}`, 'password');
            let roomData = {
                users: [],
                usersCount: 0,
                roomKey: roomKey,
                password: !!passHash
            };


            let keys = await this.redisService.hKeys(roomKey);

            let usersCount = 0;
            for (let key of keys) {
                if (key.match(/^usr(undefined|\d*)$/)) {
                    usersCount++;
                    roomData.users.push(await this.getUser(parseInt(key.split('usr').pop())));
                }
                else if (key !== 'password') {
                    roomData[key] = await this.redisService.hGet(roomKey, key);
                }
            }
            roomData.usersCount = usersCount;

            return roomData;
        }));

        return { event: ROOMS_LIST, data: [] /* roomsList */ };
    }

    @SubscribeMessage(ROOMS_GET)
    async get(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const user = await this.getUser(socket.handshake.auth.user.id);
        let roomId = user.roomId;
        let roomKey = `room${roomId}`;
        let passHash = await this.redisService.hGet(roomKey, 'password');
        let roomData = {
            users: [],
            usersCount: 0,
            password: !!passHash
        };

        let keys = await this.redisService.hKeys(roomKey);
        let usersCount = 0;
        for (let key of keys) {
            if (key.match(/^usr(undefined|\d*)$/)) {
                usersCount++;
                roomData.users.push(await this.getUser(parseInt(key.split('usr').pop())));
            }
            else if (key !== 'password') {
                roomData[key] = await this.redisService.hGet(roomKey, key);
            }
        }
        roomData.usersCount = usersCount;

        //     socket.emit('/rooms/my', roomKey, roomData);
        return { event: ROOMS_GET, data: null };
    }

    @SubscribeMessage(ROOMS_GET_ID)
    async getRoomId(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<number>> {
        const roomId = parseInt(await this.redisService.get(`usr${socket.handshake.auth.user.id}RoomId`));

        return { event: ROOMS_GET_ID, data: isNaN(roomId) ? null : roomId };
    }

    @SubscribeMessage(ROOMS_JOIN)
    async join(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const user = await this.getUser(socket.handshake.auth.user.id);
        if (!user.roomId) {
            const roomId = data.roomId.split('room').pop();

            let roomState = await this.redisService.hGet(`room${roomId}`, `state`);
            if (!roomState) {
                socket.emit('clientError', 'Room is not exist.');
            }
            else if (roomState == ROOMS_STATE_LOBBY) {
                let passHash = await this.redisService.hGet(`room${roomId}`, 'password');

                if (!passHash || data.password && passHash == createHash('sha256').update(data.password).digest('hex')) {
                    await this.redisService.hSet(`room${roomId}`, `usr${user.id}`, ROOMS_USER_STATE_ONLINE.toString());
                    this.users.set(user.id, user);

                    //assign roomId for user
                    user.roomId = roomId;
                    await this.redisService.set(`usr${user.id}RoomId`, roomId)
                    console.log(`connecting room${user.roomId} usr${user.id}`);

                    // this.socketIOServer.in(`/room${roomId}`).emit('/rooms/connect', roomId, user);
                    // socket.emit('/rooms/connect', roomId, user);
                    this.server.emit('/rooms/connect', `room${roomId}`, user);

                    socket.join(`/room${roomId}`);
                    let keys = await this.redisService.hKeys(`room${roomId}`);
                    keys = keys.filter(key => key.match(/^usr(undefined|\d*)$/));
                    let roomVolume = parseInt(await this.redisService.hGet(`room${roomId}`, 'volume'));

                    if (keys.length >= roomVolume) {
                        await this.redisService.hSet(`room${roomId}`, 'state', ROOMS_STATE_INGAME);
                        this.server.in(`/room${roomId}`).emit('/rooms/state', ROOMS_STATE_INGAME);
                    }
                }
                else {
                    socket.emit('clientError', 'Unauthorized', `room${roomId}`);
                }
            }
            else {
                socket.emit('clientError', 'Room state is not lobby.');
            }
        }
        else {
            socket.emit('clientError', `You're already in room room${user.roomId}`);
        }
        return { event: ROOMS_JOIN, data: null };
    }

    @SubscribeMessage(ROOMS_LEAVE)
    //Consider returning list?
    async leave(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomEssentialDto>> {
        const user = await this.getUser(socket.handshake.auth.user.id);

        if (user.roomId) {
            console.log(`leaving room${user.roomId} usr${user.id}`);
            await this.redisService.hDel(`room${user.roomId}`, `usr${user.id}`);
            this.users.delete(user.id);

            this.server.emit('/rooms/leave', `room${user.roomId}`, user);

            let keys = await this.redisService.hKeys(`room${user.roomId}`);
            let usersCount = keys.filter(key => key.match(/^usr(undefined|\d*)$/)).length;
            if (usersCount === 0) {
                console.log(`removing empty room${user.roomId}`, user)
                await this.redisService.del(`room${user.roomId}`);
                this.server.emit('/rooms/deleted', `room${user.roomId}`)
            }

            await this.redisService.del(`usr${user.id}RoomId`);
            user.roomId = null;
        }
        else {
            socket.emit('clientError', 'No roomId assigned to user');
        }
        return { event: ROOMS_LEAVE, data: null };
    }

    @SubscribeMessage(ROOMS_CREATE)
    async create(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomEssentialDto>> {
        const user = await this.getUser(socket.handshake.auth.user.id);
        let { name, mapId, usersCount, mode, password } = data;
        if (!password || password == '') {
            password = null;
        }
        if (password && password.length > MAX_PASSWORD_LENGTH) {
            socket.emit('clientError', `Password length should be < ${MAX_PASSWORD_LENGTH}`);
            return null;
        }
        if (!mode) {
            mode = ROOMS_MODE_DEATHMATCH;
        }
        if (!ROOMS_TYPES.includes(mode)) {
            socket.emit('clientError', `Invalid room mode ${mode}`);
            return null;
        }
        if (!name) {
            socket.emit('clientError', `Room name cannot be undefined`);
            return null;
        }
        name = name.trim();
        if (!(name.length > MIN_ROOM_NAME_LENGTH && name.length <= MAX_ROOM_NAME_LENGTH)) {
            socket.emit('clientError', `Room name length out of range (${MIN_ROOM_NAME_LENGTH} - ${MAX_ROOM_NAME_LENGTH})`);
            return null;
        }
        if (!name.match(ROOM_NAME_REGEX)) {
            socket.emit('clientError', `Room name may contain only space and specified symbols: A-Za-z0-9А-Яа-я_:№"?!-+=*/#@^,.()[]{}<>$%;&`);
            return null;
        }

        if (!user.roomId) {
            if ([
                ROOMS_MODE_DEATHMATCH,
                ROOMS_MODE_TEAM,
                ROOMS_MODE_CTF,
                ROOMS_MODE_CTP
            ].includes(mode)) {
                let roomLastId = await this.redisService.incr('roomLastId');
                let passHash: string = null;
                user.roomId = roomLastId;

                console.log(`creating room${user.roomId}`, { mapId, name, volume: usersCount || process.env['DEFAULT_ROOM_VOLUME'], state: ROOMS_STATE_LOBBY, mode, user: `usr${user.id}` });

                await this.redisService.set(`usr${user.id}RoomId`, roomLastId.toString())

                const roomData = {
                    [`usr${user.id}`]: ROOMS_USER_STATE_ONLINE,
                    'mapId': mapId,
                    'name': name,
                    'volume': usersCount || process.env['DEFAULT_ROOM_VOLUME'],
                    'state': ROOMS_STATE_LOBBY,
                    'mode': mode,
                    ...(password && { password: passHash = createHash('sha256').update(password).digest('hex') })
                };
                await this.redisService.hmSet(`room${roomLastId}`, roomData);

                this.users.set(user.id, user);

                this.server.emit('/rooms/create', `room${roomLastId}`, {
                    name: name,
                    mapId: mapId,
                    mode: mode,
                    password: !!passHash
                });
                // socket.emit('/rooms/connect', user.roomId, user);
                this.server.emit('/rooms/connect', `room${user.roomId}`, user);

                socket.join(`/room${user.roomId}`);
            }
            else {
                socket.emit('clientError', `mode should be one of ${[
                    ROOMS_MODE_DEATHMATCH,
                    ROOMS_MODE_TEAM,
                    ROOMS_MODE_CTF,
                    ROOMS_MODE_CTP
                ].join(', ')}`)
            }
        }
        else {
            socket.emit('clientError', `You're already in room room${user.roomId}`);
        }
        return { event: ROOMS_CREATE, data: null };
    }


    async getUser(id) {
        let user = this.users.get(id);
        if (user) {
            return user;
        }

        user = await this.userRepository.findOne(id);
        if (user) {
            user.roomId = parseInt(await this.redisService.get(`usr${user.id}RoomId`))
            this.users.set(user.id, user);
        }
        return user;
    }

}