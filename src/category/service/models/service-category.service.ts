import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'service_category'})
export class ServiceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  created_at: Date;
}