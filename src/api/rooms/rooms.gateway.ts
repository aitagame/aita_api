import { WebSocketGateway, SubscribeMessage, MessageBody, WsResponse } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Collection } from "typeorm";
import { RoomEssentialDto } from "./dto/roomEssential.dto";
import { ROOMS_LIST, ROOMS_LEAVE, ROOMS_JOIN, ROOMS_GET } from "./consts";
import { RoomDto } from "./dto/room.dto";


@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
export class RoomsEventsGateway {
    server: Server;

    @SubscribeMessage(ROOMS_LIST)
    list(@MessageBody() data: any): WsResponse<Array<RoomEssentialDto>> {
        //TODO: Implement via Redis
        return { event: ROOMS_LIST, data: [] };
    }

    @SubscribeMessage(ROOMS_GET)
    get(@MessageBody() data: any): WsResponse<RoomDto> {
        //TODO: Implement via Redis
        return { event: ROOMS_GET, data: null };
    }

    @SubscribeMessage(ROOMS_JOIN)
    join(@MessageBody() data: any): WsResponse<RoomDto> {
        //TODO: Implement via Redis
        return { event: ROOMS_JOIN, data: null };
    }

    @SubscribeMessage(ROOMS_LEAVE)
    //Consider returning list?
    leave(@MessageBody() data: any): WsResponse<RoomEssentialDto> {
        //TODO: Implement via Redis
        return { event: ROOMS_LEAVE, data: null };
    }
}