import {
    SubscribeMessage,
    MessageBody,
    WsResponse,
    WebSocketGateway
} from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
    cors: {
        //For debug on local device. Overriden by reverse proxy on server
        origin: "*"
    }
})
export class AuthEventsGateway {
    server: Server;

    @SubscribeMessage("verifyAuthorized")
    verifyAuthorized(@MessageBody() data: any): WsResponse<String> {
        //TODO: Verify token & then return authorization state
        return { event: "verifyAuthorized", data: "ok" };
    }

}