import { ApiProperty } from '@nestjs/swagger';

export class DataStakingDto {
  @ApiProperty({
    type: String,
    description: 'filename',
  })
  filename: string;
}