import { ApiProperty } from '@nestjs/swagger';

export class TimelineDTO {
  @ApiProperty({
    type: String,
    description: 'user id',
  })
  userId: string;

  @ApiProperty({
    type: String,
    description: 'timeline id',
  })
  timelineId: string;
}
