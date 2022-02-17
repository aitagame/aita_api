import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { UserContoller } from "./user.controller";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Module({
    controllers: [UserContoller],
    providers: [UserService],
    imports: [TypeOrmModule.forFeature([User])],
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