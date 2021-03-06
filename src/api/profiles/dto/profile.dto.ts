import { ApiProperty } from "@nestjs/swagger";
import { PlayerPositionDto } from "src/api/rooms/dto/playerPosition.dto";
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

  @ApiProperty({ description: "In-game player position" })
  position?: PlayerPositionDto
}