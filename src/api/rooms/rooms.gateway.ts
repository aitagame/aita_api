import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsResponse, WsException, BaseWsExceptionFilter, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { createHash } from "crypto";
import { RoomEssentialDto } from "./dto/roomEssential.dto";
import {
    ROOMS_LIST, ROOMS_LEAVE, ROOMS_JOIN, ROOMS_GET, ROOMS_GET_ID, ROOMS_CREATE, ROOMS_STATE_LOBBY, ROOMS_STATE_INGAME, MAX_PASSWORD_LENGTH,
    ROOMS_MODE_DEATHMATCH, ROOMS_TYPES, MAX_ROOM_NAME_LENGTH, MIN_ROOM_NAME_LENGTH, ROOM_NAME_REGEX, PROFILE_PREFIX, ROOM_PREFIX, ROOM_NAME_PREFIX,
    ROOM_PROFILE_PREFIX, PROFILE_ROOM_PREFIX, ROOMS_STATE_UNEXIST, ROOM_DEFAULT_VOLUME, ROOM_MAX_VOLUME, ROOMS_JOIN_OR_CREATE,
    BROADCAST_ROOMS_CREATED, BROADCAST_ROOMS_CONNECTED, BROADCAST_ROOMS_DISCONNECTED, BROADCAST_ROOMS_STATE_UPDATED, BROADCAST_ROOMS_DELETED, PLAYER_POSITION_TEMPLATE, PROFILE_POSITION_PREFIX, PLAYERS_WALK, PLAYER_POSITION_FIELD_LIST, ROOM_PROFILE_POSITION_PREFIX
} from "./consts";
import { RoomDto } from "./dto/room.dto";
import { WsGuard } from "../users/guards/ws.guard";
import { HttpStatus, UseFilters, UseGuards } from "@nestjs/common";
import { RedisService } from "src/storage/redis/redis.service";
import { User } from "../users/user.model";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Profile } from "../profiles/profile.model";
import { getAuthorizedUser } from "../users/guards/utils";
import ProfileDto from "../profiles/dto/profile.dto";
import { hashPassword } from "src/common/utils";
import { v4 as guid } from "uuid";
import { BaseSocketGateway } from "./baseSocket.gateway";
import { PlayerPositionDto } from "./dto/playerPosition.dto";

const roomTemplate = {
    mapId: null,
    name: null,
    volume: null,
    state: null,
    mode: null,
    icon: null,
    password: null
}
const roomFieldlist = Object.keys(roomTemplate);

@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
@UseGuards(WsGuard)
export class RoomsEventsGateway extends BaseSocketGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        protected redisService: RedisService,
        @InjectRepository(Profile)
        protected profileRepository: Repository<Profile>
    ) {
        super(redisService, profileRepository);
    }

    @SubscribeMessage(ROOMS_LIST)
    async list(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<Array<RoomEssentialDto>>> {
        const { query = null, page = 1, limit = 10 } = data;

        let roomsKeys = [];
        if (query) {
            //TODO: Replace with SCAN
            let roomNames = await this.redisService.keys(`${ROOM_NAME_PREFIX}*${query}*`);
            for (let roomName of roomNames) {
                roomsKeys.push(await this.redisService.get(`${ROOM_NAME_PREFIX}${roomName}`));
            }
        }
        else {
            roomsKeys = await this.redisService.keys(`${ROOM_PREFIX}*`);
        }

        let result: Array<RoomEssentialDto> = [];
        while (result.length < page * limit && roomsKeys.length) {
            const roomKey = roomsKeys.shift();
            const id = roomKey.split(ROOM_PREFIX).pop();
            const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;
            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${id}`)

            result.push({
                id,
                name: String(roomData.name).toString(),
                mode: roomData.mode,
                icon: null,
                isLocked: !!roomData.password,
                state: roomData.state,
                playersCount,
                volume: parseInt(roomData.volume)
            });
        }

        return { event: ROOMS_LIST, data: result };
    }

    @SubscribeMessage(ROOMS_GET)
    async get(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const user = getAuthorizedUser(socket);
        const roomId = data.id;
        //TODO: Replace with asserts
        if (!roomId) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Room ID should be provided' });
        }
        let roomKey = `${ROOM_PREFIX}${roomId}`;

        const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;
        const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomId}`);

        let result: RoomDto = await this.roomDataToDto(roomId, roomData, playersCount, user);

        return { event: ROOMS_GET, data: result };
    }

    @SubscribeMessage(ROOMS_GET_ID)
    async getRoomId(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<number>> {
        const user = getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));

        return { event: ROOMS_GET_ID, data: isNaN(roomId) ? null : roomId };
    }

    @SubscribeMessage(ROOMS_JOIN)
    async join(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const user = await getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        const currentRoomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        if (!data.id) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'Room ID should be specified' });
        }

        data.id = data.id.toString().replace(/\*/g, '');
        let roomKey = `${ROOM_PREFIX}${data.id}`;

        const roomId = parseInt(await this.redisService.hGet(roomKey, 'id'));
        if (isNaN(roomId)) {
            throw new WsException({ status: HttpStatus.NOT_FOUND, message: 'Room not found' });
        }

        if (isNaN(currentRoomId)) {
            const roomKey = `${ROOM_PREFIX}${roomId}`;
            const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;
            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomId}`);

            if (!roomData.state) {
                throw new WsException({ status: HttpStatus.NOT_FOUND, message: 'Room does not exist or has invalid state.' });
            }
            else if (roomData.state === ROOMS_STATE_LOBBY) {
                if (!roomData.password || data.password && roomData.password === hashPassword(data.password)) {
                    await this.redisService.rPush(`${ROOM_PROFILE_PREFIX}${roomId}`, profile.id.toString());
                    await this.redisService.set(`${PROFILE_ROOM_PREFIX}${profile.id}`, roomId.toString());
                    this.initProfilePlayerPosition(roomKey, profile);

                    console.log(`connecting ${roomKey} ${PROFILE_PREFIX}${profile.id}`);

                    this.server.emit(BROADCAST_ROOMS_CONNECTED, roomId, await this.buildProfileDto(roomKey, profile, user));

                    socket.join(`/${roomKey}`);

                    if (playersCount + 1 >= parseInt(roomData.volume)) {
                        roomData.state = ROOMS_STATE_INGAME;
                        await this.redisService.hSet(`${roomKey}`, 'state', roomData.state);
                        this.server.emit(BROADCAST_ROOMS_STATE_UPDATED, roomId, roomData.state);
                    }

                    return { event: ROOMS_JOIN, data: await this.roomDataToDto(roomId, roomData, playersCount, user) };
                }
                else {
                    throw new WsException({ status: HttpStatus.UNAUTHORIZED, message: `room${roomId}` });
                }
            }
            else {
                throw new WsException({ status: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Room state is not lobby.' });
            }
        }
        else {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `You're already in room ${ROOM_PREFIX}${roomId}` });
        }
    }

    @SubscribeMessage(ROOMS_LEAVE)
    //Consider returning list?
    async leave(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomEssentialDto>> {
        const profile = await this.getProfileByUser(getAuthorizedUser(socket));
        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        if (!isNaN(roomId)) {
            const roomKey = `${ROOM_PREFIX}${roomId}`;
            const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;

            console.log(`leaving ${roomKey}${PROFILE_PREFIX}${profile.id}`);
            await this.redisService.lRem(`${ROOM_PROFILE_PREFIX}${roomId}`, profile.id.toString());

            const profileKey = `${PROFILE_POSITION_PREFIX}${profile.id}`;
            const roomProfileKey = `${ROOM_PROFILE_POSITION_PREFIX}${roomKey}_${profileKey}`;
            await this.redisService.del(roomProfileKey);

            this.server.emit(BROADCAST_ROOMS_DISCONNECTED, roomId, profile.id);

            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomId}`);
            if (playersCount === 0) {
                console.log(`removing empty room ${roomKey}`, profile)
                await this.redisService.del(roomKey);
                this.server.emit(BROADCAST_ROOMS_DELETED, roomId);
                roomData.state = ROOMS_STATE_UNEXIST;
            }

            await this.redisService.del(`${PROFILE_ROOM_PREFIX}${profile.id}`);

            return { event: ROOMS_LEAVE, data: await this.roomDataToDto(roomId, roomData, playersCount, getAuthorizedUser(socket)) };
        }
        else {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'No roomId assigned to user' })
        }
    }

    @UseFilters(new BaseWsExceptionFilter())
    @SubscribeMessage(ROOMS_CREATE)
    async create(@MessageBody() data: any, @ConnectedSocket() socket: Socket, verifyRoomName: boolean = true): Promise<WsResponse<RoomDto>> {
        const user = getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        let { mapId, name, volume, mode, password } = data;
        if (!password || password == '') {
            password = null;
        }
        if (password && password.length > MAX_PASSWORD_LENGTH) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Password length should be < ${MAX_PASSWORD_LENGTH}` });
        }
        if (!mode) {
            mode = ROOMS_MODE_DEATHMATCH;
        }
        if (!ROOMS_TYPES.includes(mode)) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Invalid room mode ${mode}, should be one of ${ROOMS_TYPES.join()}` });
        }
        if (!volume) {
            volume = ROOM_DEFAULT_VOLUME;
        }
        if (volume > ROOM_MAX_VOLUME) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Max room size exceeded: ${volume} > ${ROOM_MAX_VOLUME}` });
        }
        if (verifyRoomName) {
            if (!name) {
                throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Room name cannot be undefined` });
            }
            name = name.trim();
            if (!(name.length > MIN_ROOM_NAME_LENGTH && name.length <= MAX_ROOM_NAME_LENGTH)) {
                throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Room name length out of range (${MIN_ROOM_NAME_LENGTH} - ${MAX_ROOM_NAME_LENGTH})` });
            }
            if (!name.match(ROOM_NAME_REGEX)) {
                throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Room name may contain only space and specified symbols: A-Za-z0-9А-Яа-я_:№"?!-+=*/#@^,.()[]{}<>$%;&` });
            }
        }

        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        if (isNaN(roomId)) {
            //Autoincrement :D . Consider replacing with uuidv4 if reasonable
            const roomLastId = await this.redisService.incr('roomLastId');
            const roomKey = `${ROOM_PREFIX}${roomLastId}`;
            let passHash: string = null;

            console.log(`creating ${roomKey}`, { mapId, name, volume: volume || process.env['DEFAULT_ROOM_VOLUME'], state: ROOMS_STATE_LOBBY, mode, profileId: profile.id });

            const roomData = {
                'id': roomLastId.toString(),
                'mapId': mapId || null,
                'name': name,
                'volume': volume || process.env['DEFAULT_ROOM_VOLUME'],
                'state': ROOMS_STATE_LOBBY,
                //icon: null,
                'mode': mode,
                ...(password && { password: passHash = createHash('sha256').update(password).digest('hex') })
            };
            await this.redisService.hmSet(roomKey, roomData);

            await this.redisService.rPush(`${ROOM_PROFILE_PREFIX}${roomLastId}`, profile.id.toString());
            await this.redisService.set(`${PROFILE_ROOM_PREFIX}${profile.id}`, roomLastId.toString());
            this.initProfilePlayerPosition(roomKey, profile);

            this.server.emit(BROADCAST_ROOMS_CREATED, roomId, {
                id: roomId,
                name: name,
                mapId: mapId,
                mode: mode,
                isLocked: !!passHash
            });
            this.server.emit(BROADCAST_ROOMS_CONNECTED, roomId, this.buildProfileDto(roomKey, profile, user));
            socket.join(`/${roomKey}`);

            return { event: ROOMS_CREATE, data: await this.roomDataToDto(roomLastId, roomData, 1, getAuthorizedUser(socket)) };

        }
        else {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `User already in room ${ROOM_PREFIX}${roomId}` });
        }

    }

    @UseFilters(new BaseWsExceptionFilter())
    @SubscribeMessage(ROOMS_JOIN_OR_CREATE)
    async joinOrCreate(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const user = await getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        let roomId = await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`);
        if (roomId !== null) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Already in room ${roomId}` });
        }

        const roomsKeys = await this.redisService.keys(`${ROOM_PREFIX}*`);
        let roomData = null
        let roomKey = null;
        for (let currentRoomKey of roomsKeys) {
            const currentRoomData = (await this.redisService.hmGet(currentRoomKey, roomFieldlist)) as Record<string, string>;
            const playersCount = await this.redisService.lLen(currentRoomKey);
            if (parseInt(currentRoomData.volume) < playersCount && !currentRoomData.password) {
                roomData = currentRoomData;
                roomKey = currentRoomKey;
                break;
            }
        }
        if (roomData) {
            await this.join({ id: roomData.id }, socket);
        }
        else {
            const { data } = await this.create({ name: guid() }, socket, false);
            roomData = data;
        }

        const playersCount = await this.redisService.lLen(roomKey);
        return { event: ROOMS_JOIN_OR_CREATE, data: await this.roomDataToDto(roomData.id, roomData, playersCount, user) };
    }

    private async roomDataToDto(roomId: number, roomData: Record<string, string>, playersCount: number, user: User) {
        const roomKey = `${ROOM_PREFIX}${roomId}`;
        let result: RoomDto = {
            id: roomId,
            name: roomData.name,
            mode: roomData.mode,
            mapId: roomData.mapId,
            icon: null,
            isLocked: !!roomData.password,
            state: roomData.state,
            passwordHash: null,
            playersCount,
            volume: parseInt(roomData.volume),
            players: [],
        };

        const profileIds = await this.redisService.lRange(`${ROOM_PROFILE_PREFIX}${roomId}`, 0, playersCount);
        for (let profileId of profileIds) {
            result.players.push(await this.buildProfileDto(roomKey, await this.getProfileById(parseInt(profileId)), user));
        }
        return result;
    }

    async buildProfileDto(roomKey: string, profile: Profile, user: User): Promise<ProfileDto> {
        const profileKey = `${PROFILE_POSITION_PREFIX}${profile.id}`;
        const roomProfileKey = `${ROOM_PROFILE_POSITION_PREFIX}${roomKey}_${profileKey}`;
        let playerPositionRawData = await this.redisService.hmGet(roomProfileKey, PLAYER_POSITION_FIELD_LIST);
        let playerPosition = playerPositionRawData as PlayerPositionDto;
        //TODO: Encapsulate
        playerPosition.x = parseFloat((playerPosition.x).toString());
        playerPosition.y = parseFloat((playerPosition.y).toString());

        return {
            id: profile.id,
            name: profile.name,
            class: profile.class,
            rating: profile.gamesWon,
            is_my: user === null ? null : profile.user_id === user.id,
            position: playerPosition
        };
    }

    private async initProfilePlayerPosition(roomKey: string, profile: Profile): Promise<void> {
        const profileKey = `${PROFILE_POSITION_PREFIX}${profile.id}`;
        const roomProfileKey = `${ROOM_PROFILE_POSITION_PREFIX}${roomKey}_${profileKey}`;
        const playerPosition = {
            ...PLAYER_POSITION_TEMPLATE,
            id: profile.id,
            time: Date.now()
        };
        //TODO: Implement via map
        playerPosition.x = Math.random() * 1140 + 80;
        playerPosition.y = 0;

        await this.redisService.hmSet(roomProfileKey, playerPosition);
    }
}