import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'countries' })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  region: string;

  @Column()
  subregion: string;

  @Column()
  iso3: string;

  @Column()
  iso2: string;

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

  @Column()
  numeric_code: number;

  @Column()
  phone_code: string;

  @Column()
  capital: string;

  @Column()
  currency: string;

  @Column()
  currency_symbol: string;

  @Column()
  tld: string;

  @Column()
  native: string;

  @Column()
  timezones: string;

  @Column()
  emoji: string;

  @Column()
  emojiu: string;
}
