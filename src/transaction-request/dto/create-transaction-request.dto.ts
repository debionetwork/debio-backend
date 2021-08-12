export class CreateTransactionRequestDto {
  address: string;
  currency: string;
  type: number;
  amount: bigint;
  ref_type: number;
  create_at: Date;
  ref_number: string;
  parent_id: bigint;
}