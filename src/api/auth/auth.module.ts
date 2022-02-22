import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profiles/profile.model';
import { User } from '../users/user.model';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthEventsGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User, Profile])],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsGateway],
  exports: [AuthService]
})
export class AuthModule { }
