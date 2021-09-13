import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({
    type: String,
    description: 'lab_id',
  })
  lab_id: string;

  @ApiProperty({
    type: String,
    description: 'service_id',
  })
  service_id: string;

  @ApiProperty({
    type: String,
    description: 'order_id',
  })
  order_id: string;

  @ApiProperty({
    type: String,
    description: 'rating_by',
  })
  rating_by: string;

  @ApiProperty({
    type: Number,
    description: 'rating',
  })
  rating: number;

  @ApiProperty({
    type: Date,
    description: 'created',
  })
  created: Date;
}
