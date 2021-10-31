import { ApiProperty } from '@nestjs/swagger';

export class CreateBountyDto {
  @ApiProperty({
    type: String,
    description: 'bounty_ocean',
  })
  bounty_ocean: string;

  @ApiProperty({
    type: String,
    description: 'order_id',
  })
  order_id: string;
}