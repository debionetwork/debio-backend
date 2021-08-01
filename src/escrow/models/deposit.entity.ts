import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'escrow_accounts' })
export class EscrowAccounts {
  @PrimaryGeneratedColumn()
  address: string;

  @Column()
  currency: string;

  @Column()
  balance: number;

  @Column()
  created: Date;

  @Column()
  update: Date;
}
