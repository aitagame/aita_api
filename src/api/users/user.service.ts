import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash } from "crypto";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/createUser.dto";
import { User } from "./user.model";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ){}

    //Registration user
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const findUserByEmail = await this.userRepository.findOne({
            email: createUserDto.email,
        })
        if(findUserByEmail) {
            throw new HttpException('Email are taken', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        createUserDto.password = createHash('sha256')
            .update(`${createUserDto.password}${process.env['PASSWORD_HASH_SALT']}`)
            .digest()
            .toString('hex');
        
        const createUser = new User();            
        Object.assign(createUser, createUserDto);

        return await this.userRepository.save(createUser);
    }
}