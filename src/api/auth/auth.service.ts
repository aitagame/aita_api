import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import * as nearAPI from 'near-api-js';
import { AccessKey } from './accessKey.model';
import { GetUserByAccessKeyDto } from '../users/dto/getUserByAccessKey.dto';
import { Account, connect, ConnectConfig } from 'near-api-js';
import { KeyStore } from 'near-api-js/lib/key_stores';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AccessKey)
    private readonly accessKeyRepository: Repository<AccessKey>,
  ) { }

  ping(): string {
    return 'pong';
  }

  async getAccessKey(functionalKey: string, currentPublicKey: string, accountPublicKeys: string[]): Promise<AccessKey> {
    let key = await this.accessKeyRepository.findOne({ issuer: 'near', functional_key: functionalKey });

    if (accountPublicKeys.length) {
      key = await this.accessKeyRepository.findOne({ where: { public_key: In(accountPublicKeys) } });
      return key;
    }
    return null;
  }

  async getPublicKeys(keyPairDto: GetUserByAccessKeyDto): Promise<{ currentPublicKey: string, accountPublicKeys: Array<string> }> {
    try {
      const { keyStores, KeyPair } = nearAPI;
      const keyStore = new keyStores.InMemoryKeyStore();

      const keyPair = KeyPair.fromString(keyPairDto.accessKey);

      await keyStore.setKey(process.env['NETWORK_ID'] || 'testnet', keyPairDto.accountId, keyPair);

      const near = await connect({
        networkId: process.env['NETWORK_ID'] || 'testnet',
        nodeUrl: process.env['NODE_URL'],
        keyStore: keyStore as KeyStore
      } as ConnectConfig);
      const account = await near.account(keyPairDto.accountId);
      const details = await account.getAccountDetails();

      const accountPublicKeys = details.authorizedApps.filter(app => app.contractId === process.env['CONTRACT_ID']).map(app => app.publicKey);
      const currentPublicKeyData = keyPair.getPublicKey();
      if (!currentPublicKeyData) {
        throw new HttpException('No matching public key found', HttpStatus.UNAUTHORIZED);
      }
      const currentPublicKey = currentPublicKeyData.toString();
      if (!accountPublicKeys.includes(currentPublicKey)) {
        throw new HttpException('Specified key not found in user wallet', HttpStatus.UNAUTHORIZED);
      }

      return { currentPublicKey, accountPublicKeys };
    } catch (err) {
      console.error(err);
      throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
    }
  }

  async syncPublicKeys(userId: number, publicKeys: string[]): Promise<void> {
    const allAccessKeys = await this.accessKeyRepository.find({ user_id: userId, issuer: 'near', });
    const removedAccessKeys = allAccessKeys.filter(key => !publicKeys.includes(key.public_key));
    if (removedAccessKeys.length) {
      this.accessKeyRepository.delete({ id: In(removedAccessKeys.map(item => item.id)) });
    }

    const newPublicKeys = publicKeys.filter(key => !allAccessKeys.find(accessKey => accessKey.public_key === key));
    for (let publicKey of newPublicKeys) {
      const accessKeyData = await this.accessKeyRepository.create({ issuer: 'near', user_id: userId, public_key: publicKey });
      await this.accessKeyRepository.save(accessKeyData);
    }
  }

  async createKeyWithUser(userId: number, accessKey: string, publicKey: string): Promise<AccessKey> {
    const createAccessKey = this.accessKeyRepository.create({
      issuer: 'near',
      user_id: userId,
      functional_key: accessKey,
      public_key: publicKey,
      issued_at: new Date(), //TODO: fix/delete/normal dev
      expire_at: new Date() //TODO: fix/delete/normal dev
    });
    return await this.accessKeyRepository.save(createAccessKey);
  }
}
