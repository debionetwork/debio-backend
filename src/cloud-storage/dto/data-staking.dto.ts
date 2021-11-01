import { ApiProperty } from '@nestjs/swagger';

export class DataStakingDto {
  @ApiProperty({
    type: String,
    description: 'download_url',
  })
  download_url: string;
}