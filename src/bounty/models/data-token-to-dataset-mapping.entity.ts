import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'data_token_to_dataset_mapping' })
export class DataTokenToDatasetMapping {
  @PrimaryColumn()
  mapping_id: string;

  @PrimaryColumn()
  token_id: string;

  @Column()
  filename: string;

  @Column()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;
}