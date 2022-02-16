import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/createUser.dto";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Controller('users')
export class UserContoller{
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Post('register')
    @ApiBody({ type: CreateUserDto })
    @ApiTags('users')
    @ApiResponse({ status: 201, description: 'User create'})
    @ApiResponse({ status: 422, description: 'Email are taken'})
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> { //TODO: Delete any
        return await this.userService.createUser(createUserDto);
    }
}