import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_ratings' })
export class LabRating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  lab_id: string;

  @Column()
  service_id: string;

  @Column()
  order_id: string;

  @Column()
  rating_by: string;

  @Column()
  rating: number;

  @Column()
  review: string;

  @Column()
  created: Date;
}
