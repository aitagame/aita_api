import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
    providers: [RedisService]
})
export default class RedisModule { }
