import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnaCollectionCategory } from './models/dna-collection.entity';

@Injectable()
export class DnaCollectionService {
  private readonly _logger: Logger = new Logger(DnaCollectionService.name);
  constructor(
    @InjectRepository(DnaCollectionCategory)
    private readonly dnaCollectionCategory: Repository<DnaCollectionCategory>,
  ) {}

  getAll() {
    try {
      return this.dnaCollectionCategory.find();
    } catch (error) {
      this._logger.log(error);
    }
  }
}
