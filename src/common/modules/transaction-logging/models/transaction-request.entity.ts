import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transaction_logs' })
export class TransactionRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: bigint;

  @Column()
  address: string;

  @Column()
  currency: string;

  @Column()
  transaction_type: number;

  @Column()
  amount: number;

  @Column()
  transaction_status: number;

  @Column()
  created_at: Date;

  @Column()
  ref_number: string;

  @Column({ type: 'bigint' })
  parent_id: bigint;

  @Column()
  transaction_hash: string;
}
