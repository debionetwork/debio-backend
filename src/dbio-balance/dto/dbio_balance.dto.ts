import { ApiProperty } from '@nestjs/swagger';

export class DbioBalanceDto {
  @ApiProperty({
    type: Number,
    description: 'dai',
  })
  dai: number;

  @ApiProperty({
    type: Date,
    description: 'updated',
  })
  updated: Date;
}
