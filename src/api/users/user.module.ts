import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserContoller } from "./user.controller";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Module({
    controllers: [UserContoller],
    providers: [UserService],
    imports: [TypeOrmModule.forFeature([User])],
    exports: [],
})
export class UserModule {}