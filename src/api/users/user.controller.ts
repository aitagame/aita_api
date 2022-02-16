import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { UserResponseInterface } from "./types/userResponse.interface";
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
    @ApiResponse({ status: 400, description: 'Validation failed'})
    @ApiResponse({ status: 422, description: 'Email are taken'})
    @UsePipes(new ValidationPipe())
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseInterface> { 
        const user = await this.userService.createUser(createUserDto);
        return this.userService.buildUserResponse(user);
    }

    @Post('authorization')
    @ApiBody({ type: LoginUserDto })
    @ApiTags('users')
    @ApiResponse({ status: 201, description: 'User authorized'})
    @ApiResponse({ status: 400, description: 'Validation failed'})
    @ApiResponse({ status: 400, description: 'Invalid password'})
    @ApiResponse({ status: 404, description: 'User not found'})
    @UsePipes(new ValidationPipe())
    async loginUser(@Body() loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
        const user = await this.userService.loginUser(loginUserDto);
        return this.userService.buildUserResponse(user);
    }
}