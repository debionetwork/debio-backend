import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'transaction_requests' })
export class QualityControlled {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  address: string;

  @Column()
  currency: string;

  @Column()
  type: number;

  @Column({ type: 'bigint' })
  amount: bigint;

  @Column()
  ref_type: number;

  @Column()
  create_at: Date;

  @Column()
  ref_number: string;

  @Column({ type: 'bigint' })
  parent_id: bigint;
}
