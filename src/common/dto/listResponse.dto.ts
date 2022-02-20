import { ApiProperty } from "@nestjs/swagger";

export class ListResponseDto<T> {
  @ApiProperty({ description: 'Limited of DTOs, defined by controller', type: 'object' })
  data: Array<T>;
  @ApiProperty({ description: 'Total count of resource' })
  count: number;
}