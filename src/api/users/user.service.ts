import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
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
    async createUser(createUserDto: CreateUserDto): Promise<any> { //TODO: delete any
        const findUserByEmail = await this.userRepository.findOne({
            email: createUserDto.email,
        })
        if(findUserByEmail) {
            throw new HttpException('Email are taken', HttpStatus.UNPROCESSABLE_ENTITY);
        }
        
        const createUser = new User();
        Object.assign(createUser, createUserDto);

        return await this.userRepository.save(createUser);
    }
}