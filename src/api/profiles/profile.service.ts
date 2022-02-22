import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as assert from "assert";
import { MAX_LIMIT, SORT_DIRECTIONS } from "src/common/consts";
import { ListCriteriaDto } from "src/common/dto/listCriteria.dto";
import { clearDto } from "src/common/utils";
import { Repository } from "typeorm";
import { User } from "../users/user.model";
import { PROFILE_CLASSES } from "./consts";
import ProfileDto from "./dto/profile.dto";
import { Profile } from "./profile.model";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>
  ) { }

  async createProfile(profileData: ProfileDto, user: User): Promise<Profile> {
    this.assertProfileDataValid(profileData);
    const currentProfile = await this.profileRepository.findOne({ user_id: user.id });

    assert(!currentProfile, new HttpException("Profile already exists for current user", 400));
    let profile = await this.profileRepository.save(this.profileRepository.create({
      user_id: user.id,
      name: profileData.name,
      class: profileData.class
    }));

    return profile;
  }

  async updateProfile(id: number | string, profileData: ProfileDto, user: User): Promise<Profile> {
    this.assertProfileDataValid(profileData, false, false);

    const profile = await this.getProfile(id, user);
    assert(profile.user_id === user.id, new HttpException("Access denied to update specified profile", HttpStatus.FORBIDDEN));

    delete profileData.id;
    clearDto(profileData);

    await this.profileRepository.update(id, profileData);
    return profile
  }

  async listProfiles({ limit, direction }: ListCriteriaDto): Promise<[Array<Profile>, number]> {
    assert(limit < MAX_LIMIT, new HttpException(`Limit should not exceed ${MAX_LIMIT}`, HttpStatus.BAD_REQUEST));
    assert(SORT_DIRECTIONS.includes(direction), new HttpException(`Direction should be one of ${SORT_DIRECTIONS.join()}`, HttpStatus.BAD_REQUEST));

    return await this.profileRepository
      .createQueryBuilder()
      .orderBy("gamesWon", "DESC")
      .limit()
      .getManyAndCount();
  }

  async getProfile(id: number | string, user: User): Promise<Profile> {
    let profile: Profile = null;

    if (id === "current") {
      profile = await this.profileRepository.findOne({ user_id: user.id });
      assert(!!profile, new HttpException("Profile not found for current user", HttpStatus.NOT_FOUND));
    }
    else {
      assert(id && typeof (id) === "number" && id > 0, new HttpException("Invalid profile ID. Should be number > 0 or 'current'", HttpStatus.BAD_REQUEST));
      profile = await this.profileRepository.findOne(id);
      assert(!!profile, new HttpException("Profile not found by provided ID", HttpStatus.NOT_FOUND));
    }

    return profile;
  }

  assertProfileDataValid(profileData: ProfileDto, nameEssential = true, classEssential = true) {
    const validationError = message => new HttpException(message, HttpStatus.BAD_REQUEST);

    assert(profileData, validationError("Profile data should be provided"));
    if (typeof (profileData.name) === "string") {
      profileData.name = profileData.name.trim();
    }
    if (nameEssential) {
      assert(!!profileData.name, validationError("Profile name should be provided"));
    }
    if (classEssential) {
      assert(!!profileData.class, validationError("Profile class should be provided"));
    }
    if (!!profileData.class) {
      assert(PROFILE_CLASSES.includes(profileData.class), validationError(`Invalid class. Should be one of: ${PROFILE_CLASSES.join()}`));
    }
  }

}