import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { ApiModule } from './api/api.module';
import DBModule from './storage/database/db.module';
import RedisModule from './storage/redis/redis.module';

@Module({
    imports: [
        DBModule,
        RedisModule,
        CommandModule,
        ApiModule
    ]
})
export class AppModule { }
