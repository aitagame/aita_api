import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import RedisModule from "src/storage/redis/redis.module";
import { User } from "../users/user.model";
import { UserModule } from "../users/user.module";
import { RoomsEventsGateway } from "./rooms.gateway";

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User]), RedisModule],
  providers: [RoomsEventsGateway]
})
export class RoomsModule { };