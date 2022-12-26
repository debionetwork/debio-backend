import { ApiProperty } from '@nestjs/swagger';
import { Visibility } from '../interface/post';

export class PostDTO {
  @ApiProperty({
    type: String,
    description: 'creator of post',
    required: true,
  })
  createdBy: string;

  @ApiProperty({
    type: Boolean,
    description: 'nsfw status',
    required: true,
    default: false,
  })
  isNSFW: boolean;

  @ApiProperty({
    type: Array<string>,
    description: 'mentions to',
    required: false,
  })
  mentions: string[];

  @ApiProperty({
    type: String,
    description: 'raw text of post',
    required: false,
  })
  rawText: string;

  @ApiProperty({
    type: String,
    description: 'string json of post',
    required: false,
  })
  text: string;

  @ApiProperty({
    type: String,
    description: 'status post',
    required: false,
  })
  status: string;

  @ApiProperty({
    type: Array<string>,
    description: 'mentions to',
    required: false,
  })
  tag: string[];

  @ApiProperty({
    type: Array<string>,
    description: 'mentions to',
    required: false,
  })
  selectedUserIds: string[];

  @ApiProperty({
    type: Visibility,
    description: 'mentions to',
    required: false,
  })
  visibility: Visibility;
}
