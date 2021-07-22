import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'countries' })
export class Country{
  @PrimaryGeneratedColumn()
  code: string

  @Column()
  name: string
}