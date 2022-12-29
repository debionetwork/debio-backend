import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'myriad_account' })
export class MyriadAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  address: string;

  @Index({ unique: true })
  @Column()
  username: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  jwt_token: string;
}
