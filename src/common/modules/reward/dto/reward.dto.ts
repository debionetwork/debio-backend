import { ApiProperty } from '@nestjs/swagger';

export class RewardDto {
  @ApiProperty({
    type: String,
    description: 'address',
  })
  address: string;

  @ApiProperty({
    type: String,
    description: 'ref_number',
  })
  ref_number: string;

  @ApiProperty({
    type: Number,
    description: 'reward_amount',
  })
  reward_amount: number;

  @ApiProperty({
    type: String,
    description: 'reward_type',
  })
  reward_type: string;

  @ApiProperty({
    type: String,
    description: 'currency',
  })
  currency: string;

  @ApiProperty({
    type: Date,
    description: 'create_at',
  })
  created_at: Date;
}
