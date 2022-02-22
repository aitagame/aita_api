import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class GetUserByAccessKeyDto {
    @ApiProperty()
    @IsNotEmpty()
    readonly accessKey: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly accountId: string;
}