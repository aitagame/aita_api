import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.model';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthEventsGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsGateway],
})
export class AuthModule { }
