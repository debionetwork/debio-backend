import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'rewards'})
export class Reward {
  @PrimaryGeneratedColumn({ type: 'bigint'})
  id: string;

  @Column()
  address: string;

  @Column()
  ref_number: string;

  @Column({ type: 'bigint' })
  reward_amount: bigint;

  @Column()
  reward_type: string;

  @Column()
  currency: string;

  @Column()
  create_at: Date;
}