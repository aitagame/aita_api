import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsResponse, WsException, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
    PLAYERS_WALK,
    PROFILE_POSITION_PREFIX,
    PROFILE_ROOM_PREFIX,
    ROOM_PREFIX
} from "./consts";
import { WsGuard } from "../users/guards/ws.guard";
import { HttpStatus, UseGuards } from "@nestjs/common";
import { RedisService } from "src/storage/redis/redis.service";
import { PlayerPositionDto } from "./dto/playerPosition.dto";
import { Profile } from "../profiles/profile.model";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { getAuthorizedUser } from "../users/guards/utils";
import { BaseSocketGateway } from "./baseSocket.gateway";
import { time } from "console";

const MAX_LAG = 500;
const WALK_DX = 400;

const KEYS_SUPPORTED = {
    FORWARD: 'w',
    BACKWARD: 's',
    LEFT: 'a',
    RIGHT: 'd'
}

const playerPositionTemplate = {
    id: null,
    key: null,
    //TODO: Replace with random based on platform locations
    x: 800,
    y: 400,
    time: null
}
const playerPositionFieldlist = Object.keys(playerPositionTemplate);


@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
@UseGuards(WsGuard)
export class GameEventsGateway extends BaseSocketGateway {
    @WebSocketServer()
    server: Server;

    constructor(
        protected redisService: RedisService,
        @InjectRepository(Profile)
        protected profileRepository: Repository<Profile>
    ) {
        super(redisService, profileRepository);
    }

    @SubscribeMessage(PLAYERS_WALK)
    async walk(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<void> {
        const user = getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        const roomKey = `${ROOM_PREFIX}${roomId}`;

        let { key = null, time = null } = data;
        if (key && !Object.values(KEYS_SUPPORTED).includes(key)) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Key "${key}" not supported` });
        }

        time = this.verifyTime(time);

        const profileKey = `${PROFILE_POSITION_PREFIX}${profile.id}`;
        const roomProfileKey = `${roomKey}_${profileKey}`;
        let playerPositionRawData = await this.redisService.hmGet(roomProfileKey, playerPositionFieldlist);

        if (!playerPositionRawData || !playerPositionRawData['id']) {
            playerPositionRawData = { ...playerPositionTemplate, time: Date.now() }
        }
        let playerPosition = playerPositionRawData as PlayerPositionDto;
        playerPosition.x = ~~playerPosition.x;
        playerPosition.y = ~~playerPosition.y;


        const dx = ~~(((time - playerPosition.time) * WALK_DX) / 1000);
        switch (key) {
            case KEYS_SUPPORTED.FORWARD:
                playerPosition.x += dx;
                break;
            case KEYS_SUPPORTED.BACKWARD:
                playerPosition.x -= dx;
                break;
        }
        if (playerPosition.x < 0) {
            playerPosition.x = 0;
        }

        playerPosition.id = profile.id;
        playerPosition.key = key;
        playerPosition.time = Date.now();
        this.redisService.hmSet(roomProfileKey, playerPosition);
        if (!socket.rooms.has(roomKey)) {
            socket.join(`/${roomKey}`);
        }
        this.server.in(`/${roomKey}`).emit(PLAYERS_WALK, playerPosition);
    }

    private verifyTime(time: number): number {
        const now = Date.now();
        if (time && time <= now) {
            if (now - time > MAX_LAG) {
                time = now + MAX_LAG;
            }
        }
        else {
            time = now;
        }
        return time;
    }
}