import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsPositive } from "class-validator";
import { RoomEssentialDto } from "./roomEssential.dto";


export class RoomDto extends RoomEssentialDto {
    @ApiProperty()
    //TODO: Should represent ProfileDto based on ProfileModel
    players: Array<any>;

    @ApiProperty()
    passwordHash: Array<any>;

    //TODO: Replace with ENUM
    readonly gameMode: string;

    //TODO: Replace with map model
    readonly map: string;

    //Current player's bet
    readonly bet: number;

    //Total bet for distribution
    readonly betTotal: number;
}