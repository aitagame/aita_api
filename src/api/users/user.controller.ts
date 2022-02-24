
import { Body, Controller, Get, Param, Post, Res, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiHeader, ApiResponse, ApiTags, ApiSecurity } from "@nestjs/swagger";

import { Response } from "express";
import { AuthService } from "../auth/auth.service";
import { UserDecorator } from "./decorators/user.decorator";
import { CreateUserDto } from "./dto/createUser.dto";
import { GetUserByAccessKeyDto } from "./dto/getUserByAccessKey.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { AuthGuard } from "./guards/auth.guard";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Controller('users')
export class UserContoller {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    @ApiBody({ type: CreateUserDto })
    @ApiTags('users')
    @ApiResponse({ status: 201, description: 'User create' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 422, description: 'Email are taken' })
    @UsePipes(new ValidationPipe())
    async createUser(@Body() createUserDto: CreateUserDto, @Res() response: Response): Promise<Response> {
        const user = await this.userService.createUser(createUserDto);
        response.set({ 'authorization': this.userService.generateJwt(user) });
        return response.status(201).json({ userData: user });
    }

    @Post('authorization')
    @ApiBody({ type: LoginUserDto })
    @ApiTags('users')
    @ApiResponse({ status: 200, description: 'User authorized' })
    @ApiResponse({ status: 400, description: 'Validation failed' })
    @ApiResponse({ status: 400, description: 'Invalid password' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @UsePipes(new ValidationPipe())
    async loginUser(@Body() loginUserDto: LoginUserDto, @Res() response: Response): Promise<Response> {
        const user = await this.userService.loginUser(loginUserDto);
        response.set({ 'authorization': this.userService.generateJwt(user) });
        return response.status(200).json({ userData: user });
    }

    @Get('get')
    @ApiTags('users')
    @ApiResponse({ status: 200, description: 'User get' })
    @ApiResponse({ status: 401, description: "Not authorized" })
    @ApiSecurity("Authorization")
    @UseGuards(AuthGuard)
    async getUser(@UserDecorator() user: User): Promise<User> {
        return user;
    }

    //ACCESS KEY ROUTES 

    @Post('authorization/near')
    @ApiTags('users')
    async getUserByAccessKey(@Body() getUserByAccessKeyDto: GetUserByAccessKeyDto, @Res() response: Response): Promise<Response> {
        const { currentPublicKey, accountPublicKeys } = await this.authService.getPublicKeys(getUserByAccessKeyDto);
        const key = await this.authService.getAccessKey(getUserByAccessKeyDto.accessKey, currentPublicKey, accountPublicKeys);

        let user = null;
        if (!key) {
            user = await this.userService.createUserWithKey(getUserByAccessKeyDto);
            await this.authService.createKeyWithUser(user.id, getUserByAccessKeyDto.accessKey)
        } else {
            user = await this.userService.findById(key.user_id);
        }
        await this.authService.syncPublicKeys(user.id, accountPublicKeys);

        response.set({ 'authorization': this.userService.generateJwt(user) })
        return response.status(200).json(user);
    }
}