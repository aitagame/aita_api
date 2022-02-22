import { ApiProperty } from "@nestjs/swagger";
import { PROFILE_CLASSES } from "../consts";

export default class ProfileDto {
  @ApiProperty({ description: "Unique ID in database" })
  id: number;
  @ApiProperty({ description: "Display name" })
  name: string;
  @ApiProperty({ description: `One of: ${PROFILE_CLASSES.join()}` })
  class: string;
  @ApiProperty({ description: "Rating" })
  rating: number;
  @ApiProperty({ description: "Does profile belong to the current user" })
  is_my: boolean;
}