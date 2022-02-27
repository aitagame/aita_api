import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profiles/profile.model';
import { UserModule } from '../users/user.module';
import { AccessKey } from './accessKey.model';
import { AuthController } from './auth.controller';
import { AuthEventsGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([AccessKey, Profile])],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsGateway],
  exports: [AuthService]
})
export class AuthModule { }
