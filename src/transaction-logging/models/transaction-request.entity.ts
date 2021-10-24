import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transaction_logs' })
export class TransactionRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  address: string;

  @Column()
  currency: string;

  @Column()
  transaction_type: number;

  @Column({ type: 'bigint' })
  amount: bigint;

  @Column()
  transaction_status: number;

  @Column()
  create_at: Date;

  @Column()
  ref_number: string;

  @Column({ type: 'bigint' })
  parent_id: bigint;
}
