import { ApiProperty } from '@nestjs/swagger';

export type RegistrationRole = 'lab' | 'doctor' | 'hospital';

export class GetDbioOnRegisterDto {
  @ApiProperty({ type: String })
  accountId: string;

  @ApiProperty({ description: 'RegistrationRole' })
  role: RegistrationRole;
}
