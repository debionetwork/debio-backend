import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionStatusList } from './transaction-status.list';

@Entity({ name: 'transaction_status' })
export class TransactionStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_type: number;

  @Column()
  transaction_status: TransactionStatusList;
}
