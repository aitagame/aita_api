import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessKey } from './accessKey.model';
import * as nearAPI from 'near-api-js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AccessKey)
    private readonly accessKeyRepository: Repository<AccessKey>,
  ) { }

  ping(): string {
    return 'pong';
  }

  async getKey(accessKey: string): Promise<AccessKey> {
    const key = await this.accessKeyRepository.findOne({ value: accessKey });
    if (key) {
      return key;
    }
  }

  async registerKeyValue(accessKey: string): Promise<void> {
    try {
      const { keyStores, KeyPair } = nearAPI;
      const keyStore = new keyStores.InMemoryKeyStore();
      const PRIVATE_KEY = accessKey;
      const keyPair = KeyPair.fromString(PRIVATE_KEY);

      await keyStore.setKey("testnet", "aitatest13.testnet", keyPair);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async createKeyWithUser(userId: number, accessKey: string): Promise<AccessKey> {
    const createAccessKey = this.accessKeyRepository.create({
      issuer: 'near',
      user_id: userId,
      value: accessKey,
      issued_at: new Date(), //TODO: fix/delete/normal dev
      expire_at: new Date() //TODO: fix/delete/normal dev
    });
    return await this.accessKeyRepository.save(createAccessKey);
  }
}
