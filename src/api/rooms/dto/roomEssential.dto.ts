import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class RoomEssentialDto {
    @ApiProperty()
    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
    @IsPositive()
    readonly id: number;

    @ApiProperty()
    readonly name: string;

    @ApiProperty()
    //For future. Probably will need to replace with base64. Also validate size
    readonly icon: Uint8Array;

    @ApiProperty()
    readonly isLocked: boolean;

    @ApiProperty()
    readonly mode: string;

    @ApiProperty()
    readonly state: string;

    @ApiProperty()
    readonly playersCount: number;

    @ApiProperty()
    readonly volume: number;
}