import { Body, Controller, Post } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUser.dto";
import { UserService } from "./user.service";

@Controller('users')
export class UserContoller{
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<any> { //TODO: Delete any
        const user = await this.userService.createUser(createUserDto);
        return user;
    }
}