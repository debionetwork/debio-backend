import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './models/service-category.service';

@Injectable()
export class ServiceCategoryService {
  private readonly _logger: Logger = new Logger(ServiceCategoryService.name)
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly serviceCategoryRepository: Repository<ServiceCategory>,
  ) {}

  getAll() {
    try {
      return this.serviceCategoryRepository.find();
    } catch (error) {
      this._logger.log(error);
    }
  }
}
