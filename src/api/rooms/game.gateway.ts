import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsException, WebSocketServer, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
    BROADCAST_PLAYER_MOVE,
    BROADCAST_PLAYER_UPDATE,
    PLAYERS_MOVE,
    PLAYERS_UPDATE,
    PLAYER_POSITION_FIELD_LIST,
    PROFILE_POSITION_PREFIX,
    PROFILE_ROOM_PREFIX,
    ROOM_PREFIX,
    ROOM_PROFILE_POSITION_PREFIX
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

const MAX_LAG = 500;
// const WALK_DX = 400;

// const FREEFALL_ACCELERATION = 900;
// const MAX_FALL_SPEED = 1350;

// const KEYS_SUPPORTED = {
//     FORWARD: 'KeyW',
//     BACKWARD: 'KeyS',
//     LEFT: 'KeyA',
//     RIGHT: 'KeyD'
// }
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

    @SubscribeMessage(PLAYERS_MOVE)
    async walk(@MessageBody() data: any, @ConnectedSocket() socket: Socket, eventType = PLAYERS_MOVE, broadcastType = BROADCAST_PLAYER_MOVE): Promise<WsResponse<PlayerPositionDto>> {
        const now = Date.now();

        const user = getAuthorizedUser(socket);
        const profile = await this.getProfileByUser(user);
        const roomId = parseInt(await this.redisService.get(`${PROFILE_ROOM_PREFIX}${profile.id}`));
        const roomKey = `${ROOM_PREFIX}${roomId}`;

        const profileKey = `${PROFILE_POSITION_PREFIX}${profile.id}`;
        const roomProfileKey = `${ROOM_PROFILE_POSITION_PREFIX}${roomKey}_${profileKey}`;
        let playerPositionRawData = await this.redisService.hmGet(roomProfileKey, PLAYER_POSITION_FIELD_LIST);
        let playerPosition = playerPositionRawData as PlayerPositionDto;
        if (profile.id && !playerPosition.id) {
            throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Invalid state. Profile ${profile.id} appears to be not in room ${roomId}` });
        }

        playerPosition.id = parseInt(playerPosition.id.toString());
        playerPosition.x = parseFloat((playerPosition.x).toString());
        playerPosition.y = parseFloat((playerPosition.y).toString());
        playerPosition.direction = parseInt(playerPosition.direction.toString());
        playerPosition.time = parseInt(playerPosition.time.toString());
        playerPosition.keys = playerPosition.keys ? playerPosition.keys.toString().split(',') : [];

        // time = this.verifyTime(time);

        // let dx = 0;
        // const dt = (time - playerPosition.time) / 1000;

        // for (let key of keys) {
        //     // if (key && !Object.values(KEYS_SUPPORTED).includes(key)) {
        //     //     throw new WsException({ status: HttpStatus.BAD_REQUEST, message: `Key "${key}" not supported` });
        //     // }

        //     switch (key) {
        //         case KEYS_SUPPORTED.RIGHT:
        //             dx += WALK_DX;
        //             playerPosition.direction = 1;
        //             break;
        //         case KEYS_SUPPORTED.LEFT:
        //             dx -= WALK_DX;
        //             playerPosition.direction = -1;
        //             break;
        //     }
        // }

        // playerPosition.x += dx * dt;
        // if (playerPosition.x < 0) {
        //     playerPosition.x = 0;
        // }
        if (data.keys) {
            playerPosition.keys = Array.from(new Set(data.keys));
        }

        if (!playerPosition.time || !data.time || data.time > playerPosition.time) {
            playerPosition.time = now;
            playerPosition.x = parseFloat(data.x);
            playerPosition.y = parseFloat(data.y);
            playerPosition.direction = parseInt(data.direction);
        }
        await this.redisService.hmSet(roomProfileKey, { ...playerPosition, keys: playerPosition.keys.join() });

        if (!socket.rooms.has(roomKey)) {
            socket.join(`/${roomKey}`);
        }

        //TODO: Naive implementation. Update.
        let broadcastData = {
            id: playerPosition.id,
            serverTime: playerPosition.time,
            time: playerPosition.time,
            clientTime: data.time,
            keys: playerPosition.keys,
            x: playerPosition.x,
            y: playerPosition.y,
            direction: playerPosition.direction
        };

        this.server.in(`/${roomKey}`).emit(broadcastType, broadcastData);

        return { event: eventType, data: broadcastData };
    }

    // private verifyTime(time: number): number {
    //     const now = Date.now();
    //     return time ? Math.min(Math.max(now - MAX_LAG, time), now) : now;
    // }

    @SubscribeMessage(PLAYERS_UPDATE)
    async updatePlayer(@MessageBody() data: any, @ConnectedSocket() socket: Socket): Promise<WsResponse<PlayerPositionDto>> {
        return await this.walk(data, socket, PLAYERS_UPDATE, BROADCAST_PLAYER_UPDATE);
    }
}