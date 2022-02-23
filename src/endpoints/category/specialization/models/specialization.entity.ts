import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'specialization_category' })
export class SpecializationCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  created_at: Date;
}
