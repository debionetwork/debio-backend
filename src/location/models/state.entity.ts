import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'states' })
export class State {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @Column()
  country_id: number;

  @Column()
  country_code: string;

  @Column()
  state_code: string;

  @Column({
    type: 'double precision',
  })
  latitude: number;

  @Column({
    type: 'double precision',
  })
  longitude: number;
}
