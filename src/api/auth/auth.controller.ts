import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/ping')
  getHello(): string {
    return this.authService.ping();
  }
}
