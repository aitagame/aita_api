import { createClient, RedisClientType, RedisModules } from "redis";

export class RedisService {
  constructor(private readonly redisClient: RedisClientType<RedisModules>) {
    this.redisClient = createClient();
  }

  async get(key): Promise<string> {
    return await this.redisClient.get(key);
  }
}
