import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServiceCategory } from '../../../../src/category/service/models/service-category.service';
import { ServiceCategoryService } from '../../../../src/category/service/service-category.service';
import { MockType, repositoryMockFactory } from '../../mock';
import { Repository } from 'typeorm';

describe('Service Category Service Unit Tests', () => {
  let serviceCategoryService: ServiceCategoryService;
  let repositoryMock: MockType<Repository<ServiceCategory>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceCategoryService,
        { provide: getRepositoryToken(ServiceCategory), useFactory: repositoryMockFactory },
      ],
    }).compile();
    serviceCategoryService = module.get<ServiceCategoryService>(ServiceCategoryService);
    repositoryMock = module.get(getRepositoryToken(ServiceCategory));
  });

  it('should be defined', () => {
    // Assert
    expect(serviceCategoryService).toBeDefined();
  });

  it('should find all categories', () => {
    // Arrange
    const categories = [
        {
            category: "Example 1"
        },
        {
            category: "Example 2"
        }
    ];
    repositoryMock.find.mockReturnValue(categories);

    // Assert
    expect(serviceCategoryService.getAll()).toEqual(categories);
    expect(repositoryMock.find).toHaveBeenCalled();
  });
});
