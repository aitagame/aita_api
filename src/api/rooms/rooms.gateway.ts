import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsResponse, WsException, BaseWsExceptionFilter, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { createHash } from "crypto";
import { RoomEssentialDto } from "./dto/roomEssential.dto";
import { ROOMS_LIST, ROOMS_LEAVE, ROOMS_JOIN, ROOMS_GET, ROOMS_GET_ID, ROOMS_CREATE, ROOMS_STATE_LOBBY, ROOMS_USER_STATE_ONLINE, ROOMS_STATE_INGAME, MAX_PASSWORD_LENGTH, ROOMS_MODE_DEATHMATCH, ROOMS_MODE_TEAM, ROOMS_MODE_CTF, ROOMS_MODE_CTP, ROOMS_TYPES, MAX_ROOM_NAME_LENGTH, MIN_ROOM_NAME_LENGTH, ROOM_NAME_REGEX, PROFILE_PREFIX, ROOM_PREFIX, ROOM_NAME_PREFIX, ROOM_PROFILE_PREFIX, PROFILE_ROOM_PREFIX, ROOMS_STATE_UNEXIST, ROOM_DEFAULT_VOLUME, ROOM_MAX_VOLUME } from "./consts";
import { RoomDto } from "./dto/room.dto";
import { WsGuard } from "../users/guards/ws.gurard";
import { HttpStatus, UseFilters, UseGuards } from "@nestjs/common";
import { RedisService } from "src/storage/redis/redis.service";
import { User } from "../users/user.model";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Profile } from "../profiles/profile.model";
import { getAuthorizedUser } from "../users/guards/utils";
import ProfileDto from "../profiles/dto/profile.dto";
import { hashPassword } from "src/common/utils";

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
export class RoomsEventsGateway {
    @WebSocketServer()
    server: Server;
    private userProfileMapping: Map<number, number> = new Map();
    private profiles: Map<number, Profile> = new Map();

    constructor(
        private redisService: RedisService,
        @InjectRepository(Profile)
        private profileRepository: Repository<Profile>
    ) { }

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
            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomKey}`)

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
        const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomKey}`);

        let result: RoomDto = await this.roomDataToDto(roomId, roomData, playersCount, roomKey, user);

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
        if (!roomId) {
            throw new WsException({ status: HttpStatus.NOT_FOUND, message: 'Room not found' });
        }

        if (!currentRoomId) {
            const roomKey = `${ROOM_PREFIX}${roomId}`;
            const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;
            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomKey}`);

            if (!roomData.state) {
                throw new WsException({ status: HttpStatus.NOT_FOUND, message: 'Room does not exist or has invalid state.' });
            }
            else if (roomData.state === ROOMS_STATE_LOBBY) {
                if (!roomData.password || data.password && roomData.password === hashPassword(data.password)) {
                    this.redisService.rPush(`${ROOM_PROFILE_PREFIX}${roomKey}`, profile.id.toString());
                    this.redisService.set(`${PROFILE_ROOM_PREFIX}${profile.id}`, roomId.toString());

                    console.log(`connecting ${ROOM_PREFIX}${roomKey} ${PROFILE_PREFIX}${profile.id}`);

                    this.server.emit('/rooms/connect', `room${roomId}`, user);

                    socket.join(`/${ROOM_PREFIX}${roomId}`);

                    if (playersCount + 1 >= parseInt(roomData.volume)) {
                        roomData.state = ROOMS_STATE_INGAME;
                        await this.redisService.hSet(`${ROOM_PREFIX}${roomId}`, 'state', roomData.state);
                        this.server.in(`/${ROOM_PREFIX}${roomId}`).emit('/rooms/state', roomData.state);
                    }

                    return { event: ROOMS_JOIN, data: await this.roomDataToDto(roomId, roomData, playersCount, roomKey, user) };
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
        if (roomId) {
            const roomKey = `${ROOM_PREFIX}${roomId}`;
            const roomData = (await this.redisService.hmGet(roomKey, roomFieldlist)) as Record<string, string>;

            console.log(`leaving ${roomKey}${PROFILE_PREFIX}${profile.id}`);
            await this.redisService.lRem(`${ROOM_PROFILE_PREFIX}${roomId}`, profile.id.toString());

            this.server.emit('/rooms/leave', roomKey, profile.id);

            const playersCount = await this.redisService.lLen(`${ROOM_PROFILE_PREFIX}${roomKey}`);
            if (playersCount === 0) {
                console.log(`removing empty room ${roomKey}`, profile)
                await this.redisService.del(roomKey);
                this.server.emit('/rooms/deleted', roomKey);
                roomData.state = ROOMS_STATE_UNEXIST;
            }

            await this.redisService.del(`${PROFILE_ROOM_PREFIX}${profile.id}`);

            return { event: ROOMS_LEAVE, data: await this.roomDataToDto(roomId, roomData, playersCount, roomKey, getAuthorizedUser(socket)) };
        }
        else {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: 'No roomId assigned to user' })
        }
    }

    @UseFilters(new BaseWsExceptionFilter())
    @SubscribeMessage(ROOMS_CREATE)
    async create(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<RoomDto>> {
        const profile = await this.getProfileByUser(getAuthorizedUser(socket));
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

        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        if (!roomId) {
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

            await this.redisService.rPush(`${ROOM_PROFILE_PREFIX}${roomKey}`, profile.id.toString());
            await this.redisService.set(`${PROFILE_ROOM_PREFIX}${profile.id}`, roomLastId.toString());

            this.server.emit('/rooms/create', roomKey, {
                name: name,
                mapId: mapId,
                mode: mode,
                password: !!passHash
            });
            this.server.emit('/rooms/connect', roomKey, profile);
            socket.join(`/${roomKey}`);

            return { event: ROOMS_CREATE, data: await this.roomDataToDto(roomLastId, roomData, 1, roomKey, getAuthorizedUser(socket)) };

        }
        else {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `User already in room ${ROOM_PREFIX}${roomId}` });
        }

    }

    private async roomDataToDto(roomId: number, roomData: Record<string, string>, playersCount: number, roomKey: string, user: User) {
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

        const profileIds = await this.redisService.lRange(`${ROOM_PROFILE_PREFIX}${roomKey}`, 0, playersCount);
        for (let profileId of profileIds) {
            result.players.push(this.buildProfileDto(await this.getProfileById(parseInt(profileId)), user));
        }
        return result;
    }

    buildProfileDto(profile: Profile, user: User): ProfileDto {
        return {
            id: profile.id,
            name: profile.name,
            class: profile.class,
            rating: profile.gamesWon,
            is_my: profile.user_id === user.id
        };
    }

    //TODO: Find a way to prevent possible inconsistency with 1:1 relation
    async getProfileByUser(user: User): Promise<Profile> {
        let profileId = this.userProfileMapping.get(user.id);
        if (profileId) {
            return this.getProfileById(profileId);
        }

        let profile = await this.profileRepository.findOne({ user_id: user.id });
        if (profile) {
            return this.cacheProfile(profile);
        }

        console.error(`Current user profile not found ${user.id}`);
        throw new WsException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Invalid state' });
    }

    async getProfileById(profileId: number): Promise<Profile> {
        let profile = this.profiles.get(profileId);
        if (profile) {
            return profile;
        }

        profile = await this.profileRepository.findOne(profileId);
        if (profile) {
            return this.cacheProfile(profile);
        }

        console.error(`Current profile not found ${profile.id}`);
        throw new WsException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Invalid state' });
    }

    async cacheProfile(profile: Profile): Promise<Profile> {
        this.userProfileMapping.set(profile.user_id, profile.id);
        this.profiles.set(profile.id, profile);
        return profile;
    }
}