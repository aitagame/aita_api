import { ApiProperty } from "@nestjs/swagger";

export class ListCriteriaDto {
  @ApiProperty({ description: 'Limit resource to number. Usually default is 10' })
  readonly limit: number;
  @ApiProperty({ description: 'Sort direction' })
  readonly direction: string;
}