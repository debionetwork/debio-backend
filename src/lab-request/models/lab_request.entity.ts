import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'lab_requests' })
export class LabRequest {
  @PrimaryGeneratedColumn()
  id_request: number;

  @Column()
  account_id: string;

  @Column()
  country_code: string;

  @Column()
  regional_code: string;

  @Column()
  city_code: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  service: string;

  @Column()
  create_at: string;

  @Column()
  update_at: Date;

  @Column()
  status: number;
}
