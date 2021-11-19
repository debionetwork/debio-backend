import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'data_staking_sync_events' })
export class DataStakingSyncEvents {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ nullable: true })
  data_hash: string;

  @Column()
  filename: string;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;

  @Column()
  event_processed: boolean;
}
