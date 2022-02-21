import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmrCategory } from './models/emr.entity';

@Injectable()
export class EmrService {
  constructor(
    @InjectRepository(EmrCategory)
    private readonly emrRepository: Repository<EmrCategory>,
  ) {}

  getAll() {
    return this.emrRepository.find();
  }
}
