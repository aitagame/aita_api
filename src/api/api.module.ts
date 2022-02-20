import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profiles/profile.module';
import { RoomsModule } from './rooms/rooms.module';
import { UserModule } from './users/user.module';

@Module({
    imports: [
        AuthModule,
        UserModule,
        ProfileModule,
        RoomsModule
    ]
})
export class ApiModule { }
