import { DataTokenToDatasetMapping } from '../models/data-token-to-dataset-mapping.entity';

export class DataTokenToDatasetMappingDto {
  constructor(
    private readonly dataTokenToDatasetMappingEntity?: DataTokenToDatasetMapping,
  ) {
    if (dataTokenToDatasetMappingEntity) {
      this.mapping_id = dataTokenToDatasetMappingEntity.mapping_id;
      this.token_id = dataTokenToDatasetMappingEntity.token_id;
      this.filename = dataTokenToDatasetMappingEntity.filename;
      this.created_at = dataTokenToDatasetMappingEntity.created_at;
      this.updated_at = dataTokenToDatasetMappingEntity.updated_at;
    }
  }
  mapping_id: string;
  token_id: string;
  filename: string;
  file_url: string;
  created_at: Date;
  updated_at: Date;
}
