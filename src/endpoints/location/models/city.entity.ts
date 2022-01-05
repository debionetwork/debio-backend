import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  state_id: number;

  @Column()
  state_code: string;

  @Column()
  country_id: number;

  @Column()
  country_code: string;

  @Column({
    type: 'double precision',
  })
  latitude: number;

  @Column({
    type: 'double precision',
  })
  longitude: number;
}
