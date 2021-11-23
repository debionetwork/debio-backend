import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dbio_balance' })
export class DbioBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dai: number;

  @Column()
  updated: Date;
}
