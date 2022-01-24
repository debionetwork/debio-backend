import { ApiProperty } from '@nestjs/swagger';

export class EmailNotificationDto {
  @ApiProperty({
    type: String,
    description: 'ref_number',
  })
  ref_number: string;

  @ApiProperty({
    type: String,
    description: 'notification_type',
  })
  notification_type: string;

  @ApiProperty({
    type: String,
    description: 'is_email_sent',
  })
  is_email_sent: boolean;

  @ApiProperty({
    type: Date,
    description: 'created_at',
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
    description: 'sent_at',
  })
  sent_at: Date;
}
