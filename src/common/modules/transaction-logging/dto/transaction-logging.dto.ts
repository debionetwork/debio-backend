import { Transform } from 'class-transformer';
import { TransactionStatusList } from '../../transaction-status/models/transaction-status.list';
import { TransactionTypeList } from '../../transaction-type/models/transaction-type.list';

export class TransactionLoggingDto {
  address: string;

  amount: number;

  created_at: Date;

  currency: string;

  @Transform((val) => BigInt(val.value))
  parent_id: bigint;

  ref_number: string;

  transaction_status: TransactionStatusList;

  transaction_type: TransactionTypeList;
}
