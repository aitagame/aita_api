import { ApiProperty } from "@nestjs/swagger";
import ProfileDto from "src/api/profiles/dto/profile.dto";
import { GameMode } from "../roomModes.enum";
import { RoomEssentialDto } from "./roomEssential.dto";


export class RoomDto extends RoomEssentialDto {
    @ApiProperty()
    players: Array<ProfileDto>;

    @ApiProperty()
    passwordHash: Array<any>;

    @ApiProperty()
    readonly gameMode: GameMode;

    @ApiProperty()
    readonly map: string;

    @ApiProperty()
    //Current player's bet
    readonly bet: number;

    @ApiProperty()
    //Total bet for distribution
    readonly betTotal: number;
}