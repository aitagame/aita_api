import assert from "assert";
import { createClient, RedisClientType, RedisModules } from "redis";

export class RedisService {
  constructor(private readonly redisClient: RedisClientType<RedisModules>) {
    this.redisClient = createClient();
  }

  async onModuleInit(): Promise<void> {
    await this.redisClient.connect();
  }  

  async keys(wildcard: string): Promise<string[]> {
    return await this.redisClient.keys(wildcard);
  }

  async get(key: string): Promise<string> {
    return await this.redisClient.get(key);
  }

  async incr(key: string, by: number = 1): Promise<number> {
    if (by > 1) {
      return await this.redisClient.incrBy(key, by);
    }
    return await this.redisClient.incr(key);
  }

  async set(key: string, value: string): Promise<boolean> {
    return await this.redisClient.set(key, value) === 'OK';
  }

  async del(key: string): Promise<boolean> {
    return !isNaN(await this.redisClient.del(key));
  }

  async hKeys(key: string): Promise<string[]> {
    return await this.redisClient.hKeys(key);
  }

  async hLen(key: string): Promise<number> {
    return await this.redisClient.hLen(key);
  }

  async hGet(key: string, field: string): Promise<string> {
    return await this.redisClient.hGet(key, field);
  }

  async hDel(key: string, field: string): Promise<boolean> {
    return !isNaN(await this.redisClient.hDel(key, field));
  }

  async hSet(key: string, field: string, value: string): Promise<boolean> {
    return !isNaN(await this.redisClient.hSet(key, field, value));
  }

  async hmGet(key: string, fields: string[] | object): Promise<object> {
    assert(fields !== null, new Error('Data cannot be null'));
    const keys = fields instanceof Array ? fields : Object.keys(fields);
    const data = await this.redisClient.hmGet(key, keys);

    return keys.reduce((prev, value, index) => {
      prev[value] = data[index];
      return prev
    }, {});
  }

  async hmSet(key: string, data: object | Map<string, string>): Promise<boolean> {
    assert(data !== null, new Error('Data cannot be null'));

    const resp = await this.redisClient.hSet(key, data instanceof Map
      ? data
      : Object.keys(data).reduce((map, key) => map.set(key, data[key]), new Map<string, string>())
    );

    return !isNaN(resp);
  }
}
