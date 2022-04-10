import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  role: string;

  @Column()
  entity_type: string;

  @Column()
  entity: string;

  @Column()
  description: string;

  @Column()
  read: boolean;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  deleted_at: Date;

  @Column()
  from: string;

  @Column()
  to: string;
}
