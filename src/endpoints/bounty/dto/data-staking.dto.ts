import { ApiProperty } from '@nestjs/swagger';

export class DataStakingDto {
  @ApiProperty({
    type: String,
    description: 'order_id',
  })
  order_id: string;

  @ApiProperty({
    type: Number,
    description: 'service_category_id',
  })
  service_category_id: number;

  @ApiProperty({
    type: String,
    description: 'filename',
  })
  filename: string;
}
