import { WsException } from "@nestjs/websockets";
import { Server } from "socket.io";
import { HttpStatus } from "@nestjs/common";
import { RedisService } from "src/storage/redis/redis.service";
import { Profile } from "../profiles/profile.model";
import { User } from "../users/user.model";
import { Repository } from "typeorm";


export class BaseSocketGateway {
  server: Server;
  protected userProfileMapping: Map<number, number> = new Map();
  protected profiles: Map<number, Profile> = new Map();

  constructor(
      protected redisService: RedisService,
      protected profileRepository: Repository<Profile>
  ) { }

     //TODO: Find a way to prevent possible inconsistency with 1:1 relation
     async getProfileByUser(user: User): Promise<Profile> {
      let profileId = this.userProfileMapping.get(user.id);
      if (profileId) {
          return this.getProfileById(profileId);
      }

      let profile = await this.profileRepository.findOne({ user_id: user.id });
      if (profile) {
          return this.cacheProfile(profile);
      }

      console.error(`Current user profile not found ${user.id}`);
      throw new WsException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Invalid state' });
  }

  async getProfileById(profileId: number): Promise<Profile> {
      console.log({ profileId })
      let profile = this.profiles.get(profileId);
      if (profile) {
          return profile;
      }

      profile = await this.profileRepository.findOne(profileId);
      if (profile) {
          return this.cacheProfile(profile);
      }

      console.error(`Current profile not found ${profileId}`);
      throw new WsException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Invalid state' });
  }

  async cacheProfile(profile: Profile): Promise<Profile> {
      this.userProfileMapping.set(profile.user_id, profile.id);
      this.profiles.set(profile.id, profile);
      return profile;
  }
}