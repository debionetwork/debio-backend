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
    type: "double precision"
  })
  latitude: number;

  @Column({
    type: "double precision"
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
