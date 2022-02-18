import { Body, Controller, Get, Post, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { UserDecorator } from "./decorators/user.decorator";
import { CreateUserDto } from "./dto/createUser.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { AuthGuard } from "./guards/auth.guard";
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
    async createUser(@Body() createUserDto: CreateUserDto, @Res() response: Response): Promise<Response> { 
        const user = await this.userService.createUser(createUserDto);
        response.set({ 'authorization':  this.userService.generateJwt(user)});
        return response.status(201).json({ message: "User create" });
    }

    @Post('authorization')
    @ApiBody({ type: LoginUserDto })
    @ApiTags('users')
    @ApiResponse({ status: 201, description: 'User authorized'})
    @ApiResponse({ status: 400, description: 'Validation failed'})
    @ApiResponse({ status: 400, description: 'Invalid password'})
    @ApiResponse({ status: 404, description: 'User not found'})
    @UsePipes(new ValidationPipe())
    async loginUser(@Body() loginUserDto: LoginUserDto, @Res() response: Response): Promise<Response> {
        const user = await this.userService.loginUser(loginUserDto);
        response.set({ 'authorization':  this.userService.generateJwt(user)});
        return response.status(201).json({ message: "User authorized" });
    }

    @Get('get')
    @ApiTags('users')
    @ApiResponse({ status: 200, description: 'User get'})
    @ApiResponse({ status: 401, description:"Not authorized" })
    @ApiHeader({
        name:"authorization",
        description:"JWT Token"
    })
    @UseGuards(AuthGuard)
    async getUser(@UserDecorator() user: User): Promise<User> {
        return user;
    }
}