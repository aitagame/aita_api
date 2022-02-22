import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessKey } from './accessKey.model';
import { AuthController } from './auth.controller';
import { AuthEventsGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessKey])],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsGateway],
  exports: [AuthService]
})
export class AuthModule { }
