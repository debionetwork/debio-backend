import { ApiProperty } from "@nestjs/swagger";

export class NotificationDto {
  @ApiProperty({
    type: String,
    description: 'role',
  })
  role: string;

  @ApiProperty({
    type: String,
    description: 'entity_type',
  })
  entity_type: string;

  @ApiProperty({
    type: String,
    description: 'entity',
  })
  entity: string;

  @ApiProperty({
    type: String,
    description: 'description',
  })
  description: string;

  @ApiProperty({
    type: Boolean,
    description: 'read',
  })
  read: boolean;

  @ApiProperty({
    type: String,
    description: 'created_at',
  })
  created_at: Date;

  @ApiProperty({
    type: String,
    description: 'updated_at',
  })
  updated_at: Date;

  @ApiProperty({
    type: String,
    description: 'deleted_at',
  })
  deleted_at: Date;

  @ApiProperty({
    type: String,
    description: 'from',
  })
  from: string;

  @ApiProperty({
    type: String,
    description: 'to',
  })
  to: string;
}