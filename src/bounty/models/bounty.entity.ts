import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'data_bounty' })
export class DataBounty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash_bounty_ocean: string;

  @Column()
  service_name: string;

  @Column()
  lab_name: string;

  @Column()
  description: string;

  @Column()
  reward: string;
}
