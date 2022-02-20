import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { verify } from "jsonwebtoken";
import { Socket } from "socket.io";
import { UserService } from "../user.service";
import { isUserAuthorized } from "./utils";

@Injectable()
export class WsGuard implements CanActivate {
    constructor(private readonly userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        if (isUserAuthorized(client)) {
            return true;
        }
        if (client.handshake.headers.authorization) {
            const token = client.handshake.headers.authorization;
            const decode = verify(token, process.env['JWT_SECRET']);
            const user = await this.userService.findById(decode.id);
            client.handshake.auth.user = user;
            return true;
        }

        throw new WsException('Not authorized');
    }
}