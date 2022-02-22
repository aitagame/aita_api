import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { AccessKey } from "../auth/accessKey.model";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { UserContoller } from "./user.controller";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Module({
    controllers: [UserContoller],
    providers: [UserService, AuthService],
    imports: [
        TypeOrmModule.forFeature([User]),
        TypeOrmModule.forFeature([AccessKey])
    ],
    exports: [],
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path:'*',
            method: RequestMethod.GET
        })
    }
}