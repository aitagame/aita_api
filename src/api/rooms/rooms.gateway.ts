import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WsResponse } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RoomEssentialDto } from "./dto/roomEssential.dto";
import { ROOMS_LIST, ROOMS_LEAVE, ROOMS_JOIN, ROOMS_GET } from "./consts";
import { RoomDto } from "./dto/room.dto";
import { WsGuard } from "../users/guards/ws.gurard";
import { UseGuards } from "@nestjs/common";


@WebSocketGateway({
    cors: {
        origin: "*"
    }
})
@UseGuards(WsGuard)
export class RoomsEventsGateway {
    server: Server;

    @SubscribeMessage(ROOMS_LIST)
    list(@MessageBody() data: any, @ConnectedSocket() socket: Socket): WsResponse<Array<RoomEssentialDto>> {
        //TODO: Implement via Redis
        return { event: ROOMS_LIST, data: [{id:1, name: 'a', isLocked: false, icon:null, playersCount:0 }] };
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