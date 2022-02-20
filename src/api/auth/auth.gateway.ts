import { UseGuards } from "@nestjs/common";
import {
    SubscribeMessage,
    WsResponse,
    WebSocketGateway,
    ConnectedSocket,
    WsException
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { isUserAuthorized } from "../users/guards/utils";
import { WsGuard } from "../users/guards/ws.gurard";

@WebSocketGateway({
    cors: {
        //For debug on local device. Overriden by reverse proxy on server
        origin: "*"
    }
})
export class AuthEventsGateway {
    server: Server;

    @SubscribeMessage("verifyAuthorized")
    verifyAuthorized(@ConnectedSocket() socket: Socket): WsResponse<boolean> {
        if (process.env['NODE_ENV'] === 'production') {
            throw new WsException('Not available for production environment');
        }
        return { event: "verifyAuthorized", data: isUserAuthorized(socket) };
    }

    @SubscribeMessage("authorize")
    @UseGuards(WsGuard)
    authorize(@ConnectedSocket() socket: Socket): WsResponse<boolean> {
        if (process.env['NODE_ENV'] === 'production') {
            throw new WsException('Not available for production environment');
        }
        return { event: "authorize", data: true }
    }

}