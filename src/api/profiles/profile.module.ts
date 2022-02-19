import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthMiddleware } from "src/middlewares/auth.middleware";
import { User } from "../users/user.model";
import { UserService } from "../users/user.service";
import { ProfilesController } from "./profile.controller";
import { Profile } from "./profile.model";
import { ProfileService } from "./profile.service";

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  controllers: [ProfilesController],
  providers: [ProfileService, UserService]
})
export class ProfileModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}