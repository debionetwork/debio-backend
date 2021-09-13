import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'states' })
export class State {
  @PrimaryGeneratedColumn()
  id: number;
<<<<<<< HEAD
  
=======

>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  @Column()
  name: string;

  @Column()
  country_id: number;

  @Column()
  country_code: string;

  @Column()
  state_code: string;

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
