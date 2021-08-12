import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'transaction_requests'})
export class TransactionRequest {
  @PrimaryGeneratedColumn()
  id: bigint;

  @Column()
  address: string;
  
  @Column()
  currency: string;
  
  @Column()
  type: number;
  
  @Column()
  amount: bigint;
  
  @Column()
  ref_type: number;
  
  @Column()
  create_at: Date;
  
  @Column()
  ref_number: string
  
  @Column()
  parent_id: bigint;
  
}