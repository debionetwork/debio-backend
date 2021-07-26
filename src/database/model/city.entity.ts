import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn()
  code: string;

  @Column()
  region_code: string;

  @Column()
  country_code: string;

  @Column()
  name: string;
}
