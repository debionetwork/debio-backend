import { Transform } from "class-transformer";

export class CreateTransactionRequestDto {
  address: string;
  currency: string;
  type: number;
  @Transform(amount => BigInt(amount.value))
  amount: bigint;
  ref_type: number;
  create_at: Date;
  ref_number: string;
  @Transform(parent_id => BigInt(parent_id.value))
  parent_id: bigint;
}