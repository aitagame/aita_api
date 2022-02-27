import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { assert } from "console";
import { sign, decode } from 'jsonwebtoken';
import { hashPassword } from "src/common/utils";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { GetUserByAccessKeyDto } from "./dto/getUserByAccessKey.dto";
import { LoginUserDto } from "./dto/loginUser.dto";
import { User } from "./user.model";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    //Registration user
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({
            email: createUserDto.email,
        })
        if (user) {
            throw new HttpException('Email are taken', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        createUserDto.password = hashPassword(createUserDto.password);

        const createUser = new User();
        Object.assign(createUser, createUserDto);
        await this.userRepository.save(createUser);
        delete createUser.password;

        return createUser;
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<User> {
        const user = await this.userRepository.findOne(
            { email: loginUserDto.email },
            { select: ['id', 'email', 'password', 'firstName', 'lastName', 'clan_id'] },
        )
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        loginUserDto.password = hashPassword(loginUserDto.password);

        if (loginUserDto.password !== user.password) {
            throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
        }
        delete user.password;

        return user;
    }

    async createUserWithKey(getUserByAccessKeyDto: GetUserByAccessKeyDto): Promise<User> {
        const createUser = this.userRepository.create({ firstName: getUserByAccessKeyDto.accountId });
        await this.userRepository.save(createUser);
        delete createUser.password;
        return createUser;
    }


    //Regular functions
    // buildUserResponse(user: User): UserResponseInterface {
    //     return {
    //         user: {
    //             ...user,
    //             token: this.generateJwt(user)
    //         }
    //     }
    // }

    findById(id: number, options?): Promise<User> {
        assert(!!id, new HttpException('ID should be provided!', HttpStatus.INTERNAL_SERVER_ERROR));
        return this.userRepository.findOne(id, options);
    }

    findByParams(params: object): Promise<User> {
        return this.userRepository.findOne(params);
    }

    public generateJwt(user: User): string {
        return sign({
            id: user.id,
            email: user.email,
        }, process.env['JWT_SECRET'])
    }

    public decodeJwt(token: string): any { //TODO: delete any type
        return decode(token);
    }
}