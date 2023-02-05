import { ApiProperty } from '@nestjs/swagger';

export class HealthProfessionalRegisterDTO {
  @ApiProperty({
    type: String,
    description: 'account id',
    required: true,
  })
  account_id: string;

  @ApiProperty({
    type: String,
    description: 'hex account id',
    required: false,
  })
  hex_account_id: string;

  @ApiProperty({
    type: String,
    description: 'verification status',
    required: true,
    enum: ['Unverified', 'Verified', 'Rejected', 'Revoked']
  })
  verification_status: string;

  @ApiProperty({
    type: Array<string>,
    description: 'user id myriad',
    required: true,
  })
  selected_user_id: string[];

  @ApiProperty({
    type: String,
    description: 'timeline id',
    required: true,
  })
  timeline_id: string;
}
