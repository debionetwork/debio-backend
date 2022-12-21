import { ApiProperty } from '@nestjs/swagger';

export class ProfileDTO {
  @ApiProperty({
    type: String,
    description: 'name',
    required: false,
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'profile bio',
    required: false,
  })
  bio: string;

  @ApiProperty({
    type: String,
    description: 'website url',
    required: false,
  })
  websiteURL: string;
}
