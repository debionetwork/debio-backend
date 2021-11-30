import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'data_staking_events' })
export class DataStakingEvents {
  @PrimaryColumn()
  order_id: string;

  @Column()
  service_category_id: number;

  @Column()
  filename: string;

  @Column()
  created_at: Date;
  
  @Column({ nullable: true })
  updated_at: Date;

  @Column()
  event_processed: boolean;
}