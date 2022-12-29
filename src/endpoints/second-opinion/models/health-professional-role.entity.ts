import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'health_professional_role' })
export class HealthProfessionalRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  created_at: Date;
}
