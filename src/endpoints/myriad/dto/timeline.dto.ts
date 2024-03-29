import { ApiProperty } from '@nestjs/swagger';

export class TimelineDTO {
  @ApiProperty({
    type: Array<string>,
    description: 'selected user id',
  })
  selectedUser: string[];

  @ApiProperty({
    type: String,
    description: 'timeline id',
  })
  timelineId: string;
}
