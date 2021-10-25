import { ApiProperty } from '@nestjs/swagger';

export class CreateBountyDto {
  @ApiProperty({
    type: String,
    description: 'bounty_ocean',
  })
  bounty_ocean: string;

  @ApiProperty({
    type: String,
    description: 'service_name',
  })
  service_name: string;

  @ApiProperty({
    type: String,
    description: 'lab_name',
  })
  lab_name: string;

  @ApiProperty({
    type: String,
    description: 'description',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: 'reward',
  })
  reward: string;
}