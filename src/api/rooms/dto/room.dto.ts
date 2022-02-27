import { ApiProperty } from "@nestjs/swagger";
import ProfileDto from "src/api/profiles/dto/profile.dto";
import { RoomEssentialDto } from "./roomEssential.dto";


export class RoomDto extends RoomEssentialDto {
    @ApiProperty()
    players: Array<ProfileDto>;

    @ApiProperty()
    passwordHash: string;

    @ApiProperty()
    readonly mapId: string;

    // @ApiProperty()
    // //Current player's bet
    // readonly bet: number;

    // @ApiProperty()
    // //Total bet for distribution
    // readonly betTotal: number;
}