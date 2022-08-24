import { ApiProperty } from '@nestjs/swagger';

export class DataListIdDto {
  @ApiProperty({
    type: Array<string>,
    description: 'ids',
  })
  ids: string[];
}
