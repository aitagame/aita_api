import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtPayload, verify } from "jsonwebtoken";
import { Socket } from "socket.io";
import { UserService } from "../user.service";
import { failUnauthorized, isUserAuthorized, setAuthorizedUser } from "./utils";

@Injectable()
export class WsGuard implements CanActivate {
    constructor(private readonly userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client = context.switchToWs().getClient<Socket>();
        if (isUserAuthorized(client)) {
            return true;
        }
        const token = client.handshake.auth.authorization || client.handshake.headers.authorization;
        if (token) {
            const decode = verify(token, process.env['JWT_SECRET']);
            if (!decode) {
                return failUnauthorized(client);
            }
            const user = await this.userService.findById((decode as JwtPayload).id);
            if (!user) {
                return failUnauthorized(client);
            }

            setAuthorizedUser(client, user);
            return true;
        }

        return failUnauthorized(client);
    }
}