import { ApiProperty } from '@nestjs/swagger';

export class CreateBountyDto {
  @ApiProperty({
    type: String,
    description: 'bounty_ocean',
  })
  bounty_ocean: string;
}