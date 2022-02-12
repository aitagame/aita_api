import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthEventsGateway } from './auth.gateway';
import { AuthService } from './auth.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, AuthEventsGateway],
})
export class AuthModule { }
