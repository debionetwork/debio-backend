import { Transform } from "class-transformer";

export class TransactionLoggingDto {
  address: string;

  @Transform(val => BigInt(val.value))
  amount: bigint;
  
  created_at: Date;
  
  currency: string;
  
  @Transform(val => BigInt(val.value))
  parent_id: bigint;
  
  ref_number: string;
  
  transaction_status: number;
  
  transaction_type: number;
}