import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'emr_category' })
export class EmrCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  created_at: Date;
}