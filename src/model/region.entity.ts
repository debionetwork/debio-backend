import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'regions' })
export class Region{
  @PrimaryGeneratedColumn()
  code: string

  @Column()
  country_code: string

  @Column()
  name: string
}