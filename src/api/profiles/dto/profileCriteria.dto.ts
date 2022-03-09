import { ApiProperty } from "@nestjs/swagger";
import { ListCriteriaDto } from "src/common/dto/listCriteria.dto";

export class ProfileCriteriaDto extends ListCriteriaDto {
  @ApiProperty()
  user_id: number
};
