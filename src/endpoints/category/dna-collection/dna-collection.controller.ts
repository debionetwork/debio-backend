import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../../common';
import { dnaCollectionCategories } from './models/response';
import { DnaCollectionService } from './dna-collection.service';

@UseInterceptors(SentryInterceptor)
@Controller('dna-collection-category')
export class DnaCollectionController {
  constructor(private readonly dnaCollectionService: DnaCollectionService) {}

  @Get()
  @ApiOperation({
    description: 'get categories of dna collection process list.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: dnaCollectionCategories,
    },
  })
  getDnaCollectionCategory() {
    return this.dnaCollectionService.getAll();
  }
}
