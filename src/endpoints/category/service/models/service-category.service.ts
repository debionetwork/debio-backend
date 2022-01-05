import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'service_category' })
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  service_categories: string;

  @Column()
  name: string;

  @Column()
  ticker: string;

  @Column()
  created_at: Date;

  @Column()
  service_type: string;
}
