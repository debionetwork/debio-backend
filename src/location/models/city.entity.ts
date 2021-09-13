import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'cities' })
export class City {
  @PrimaryGeneratedColumn()
  id: number;
<<<<<<< HEAD
  
  @Column()
  name: string;

  @Column()
  state_id: number;

  @Column()
  state_code: string;

  @Column()
=======

  @Column()
  name: string;

  @Column()
  state_id: number;

  @Column()
  state_code: string;

  @Column()
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  country_id: number;

  @Column()
  country_code: string;

  @Column({
<<<<<<< HEAD
    type: "double precision"
=======
    type: 'double precision',
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  })
  latitude: number;

  @Column({
<<<<<<< HEAD
    type: "double precision"
=======
    type: 'double precision',
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  })
  longitude: number;
}
