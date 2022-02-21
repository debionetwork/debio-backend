import { ApiProperty } from '@nestjs/swagger';

export class TransactionHashDto {
  @ApiProperty({
    type: String,
    description: 'transaction_hash',
    required: true,
  })
  transaction_hash: string;

  @ApiProperty({
    type: String,
    description: 'order_id',
    required: true,
  })
  order_id: string;
}
