import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { AccessKey } from "../auth/accessKey.model";
import { AuthService } from "../auth/auth.service";
import { Profile } from "../profiles/profile.model";
import { UserContoller } from "./user.controller";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Module({
    controllers: [UserContoller],
    providers: [UserService, AuthService],
    imports: [TypeOrmModule.forFeature([User, Profile, AccessKey])]
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes({
            path:'*',
            method: RequestMethod.GET
        })
    }
}