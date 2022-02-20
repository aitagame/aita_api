import { Injectable, NestMiddleware } from "@nestjs/common";
import { verify } from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { UserService } from "src/api/users/user.service";
import { ExpressRequestInterface } from "src/types/expressRequest.interface";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly userService: UserService) {}
    async use(req: ExpressRequestInterface, _res: Response, next: NextFunction) {
        if(!req.headers.authorization) {
            req.user = null;
            next();
            return;
        }

        const token = req.headers.authorization;
        try {
            const decode = verify(token, process.env['JWT_SECRET']);
            const user = await this.userService.findById(decode.id);
            req.user = user;
            next();
        } catch (err) {
            console.log(err);
            req.user = null;
            next();
        }
    }
}