import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDTO {
  @ApiProperty({
    type: Number,
    description: 'nonce',
  })
  nonce: number;

  @ApiProperty({
    type: String,
    description: 'publicAddress',
  })
  publicAddress: string;
  
  @ApiProperty({
    type: String,
    description: 'signature',
  })
  signature: string;
  
  @ApiProperty({
    type: String,
    description: 'walletType',
  })
  walletType: string;
  
  @ApiProperty({
    type: String,
    description: 'networkType',
  })
  networkType: string;
  
  @ApiProperty({
    type: String,
    description: 'role',
  })
  role: string;
}