import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'health_professional_specialization' })
export class HealthProfessionalSpecialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  specialization: string;

  @Column()
  created_at: Date;
}
