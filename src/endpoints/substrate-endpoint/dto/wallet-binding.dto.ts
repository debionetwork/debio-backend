import { ApiProperty } from '@nestjs/swagger';

export class WalletBindingDTO {
  @ApiProperty({ type: String })
  accountId: string;

  @ApiProperty({ type: String })
  ethAddress: any;

  @ApiProperty({ type: String })
  role: 'Customer' | 'Lab' | 'GA';
}
