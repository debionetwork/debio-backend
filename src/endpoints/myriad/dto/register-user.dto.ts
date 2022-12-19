import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDTO {
  @ApiProperty({
    type: String,
    description: 'username',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: 'name',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'address',
  })
  address: string;

  @ApiProperty({
    type: String,
    description: 'role',
  })
  role: string;
}
