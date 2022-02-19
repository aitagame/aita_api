import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags, ApiParam, ApiSecurity, ApiQuery } from "@nestjs/swagger";
import { DEFAULT_LIMIT } from "src/common/consts";
import { ListCriteriaDto } from "src/common/dto/listCriteria.dto";
import { UserDecorator } from "../users/decorators/user.decorator";
import { AuthGuard } from "../users/guards/auth.guard";
import { User } from "../users/user.model";
import ProfileDto from "./dto/profile.dto";
import { ProfileService } from "./profile.service";

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
  async createProfile(@Body() profileData: ProfileDto, @UserDecorator() user: User) {
    return await this.profileService.createProfile(profileData, user);
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
  async updateProfile(@Param("id") id: number | string, @Body() profileData: ProfileDto, @UserDecorator() user: User) {
    return await this.profileService.updateProfile(id, profileData, user);
  }

  @Get()
  @ApiQuery({ name: "limit", type: "number", "example": DEFAULT_LIMIT })
  @ApiQuery({ name: "direction", type: "string", "example": "DESC" })
  @ApiTags("profiles")
  @ApiResponse({ type: ProfileDto, status: HttpStatus.OK, description: "Profile list built" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid criteria" })
  @UseGuards(AuthGuard)
  async listProfiles(@Query() criteria: ListCriteriaDto) {
    return await this.profileService.listProfiles(criteria);
  }

  @Get(":id")
  @ApiTags("profiles")
  @ApiParam({ name: "id", description: "Numeric profile ID or 'current' for current user profile" })
  @ApiResponse({ type: ProfileDto, status: HttpStatus.OK, description: "Profile found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Profile not found" })
  @UseGuards(AuthGuard)
  async getProfile(@Param("id") id: number | string, @UserDecorator() user: User) {
    return await this.profileService.getProfile(id, user);
  }
}