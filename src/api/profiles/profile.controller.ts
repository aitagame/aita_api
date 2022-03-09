import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags, ApiParam, ApiSecurity, ApiQuery, ApiExtraModels } from "@nestjs/swagger";
import { DEFAULT_LIMIT } from "src/common/consts";
import { ListResponseDto } from "src/common/dto/listResponse.dto";
import { listDtoToSchema } from "src/common/utils";
import { UserDecorator } from "../users/decorators/user.decorator";
import { AuthGuard } from "../users/guards/auth.guard";
import { User } from "../users/user.model";
import ProfileDto from "./dto/profile.dto";
import { ProfileCriteriaDto } from "./dto/profileCriteria.dto";
import { Profile } from "./profile.model";
import { ProfileService } from "./profile.service";

// class ProfileListDto extends ListResponseDto<ProfileDto> {}; 

@Controller("profiles")
@ApiSecurity("Authorization")
export class ProfilesController {
  constructor(
    private readonly profileService: ProfileService
  ) { }

  @Post()
  @ApiBody({ type: ProfileDto })
  @ApiTags("profiles")
  @ApiResponse({ type: ProfileDto, status: HttpStatus.CREATED, description: "Profile created" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid profile data" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Profile already exists" })
  @UseGuards(AuthGuard)
  async createProfile(@Body() profileData: ProfileDto, @UserDecorator() user: User): Promise<ProfileDto> {
    return this.buildProfileDto(await this.profileService.createProfile(profileData, user), user);
  }

  @Put(":id")
  @ApiBody({ type: ProfileDto })
  @ApiTags("profiles")
  @ApiParam({ name: "id", description: "Numeric profile ID or 'current' for current user profile" })
  @ApiResponse({ type: ProfileDto, status: HttpStatus.OK, description: "Profile updated" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid profile data" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Profile not found" })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Access denied updating profile" })
  @UseGuards(AuthGuard)
  async updateProfile(@Param("id") id: number | string, @Body() profileData: ProfileDto, @UserDecorator() user: User): Promise<ProfileDto> {
    let numericId = parseInt(id as string);
    return this.buildProfileDto(await this.profileService.updateProfile(isNaN(numericId) ? id : parseInt(id as string), profileData, user), user);
  }

  @Get()
  @ApiQuery({ name: "limit", type: "number", "example": DEFAULT_LIMIT })
  @ApiQuery({ name: "direction", type: "string", "example": "DESC" })
  @ApiTags("profiles")
  @ApiResponse({ schema: listDtoToSchema(ListResponseDto, ProfileDto), status: HttpStatus.OK, description: "Profile list built" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid criteria" })
  @UseGuards(AuthGuard)
  @ApiExtraModels(ProfileCriteriaDto, ListResponseDto, ProfileDto)
  async listProfiles(@Query() criteria: ProfileCriteriaDto, @UserDecorator() user: User): Promise<ListResponseDto<ProfileDto>> {
    const [profilesData, count] = await this.profileService.listProfiles(criteria);
    return { data: this.buildProfileDtoList(profilesData, user), count };
  }

  @Get(":id")
  @ApiTags("profiles")
  @ApiParam({ name: "id", description: "Numeric profile ID or 'current' for current user profile" })
  @ApiResponse({ type: ProfileDto, status: HttpStatus.OK, description: "Profile found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Profile not found" })
  @UseGuards(AuthGuard)
  async getProfile(@Param("id") id: number | string, @UserDecorator() user: User): Promise<ProfileDto> {
    return this.buildProfileDto(await this.profileService.getProfile(id, user), user);
  }


  buildProfileDtoList(profiles: Array<Profile>, user: User) {
    return profiles.map(profile => this.buildProfileDto(profile, user)).flat();
  }

  buildProfileDto(profile: Profile, user: User): ProfileDto {
    return {
      id: profile.id,
      name: profile.name,
      class: profile.class,
      rating: profile.gamesWon,
      is_my: profile.user_id === user.id
    };
  }
}