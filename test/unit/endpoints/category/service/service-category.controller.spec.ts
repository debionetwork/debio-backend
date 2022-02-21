import { Test, TestingModule } from '@nestjs/testing';
import { ServiceCategoryService } from '../../../../../src/endpoints/category/service/service-category.service';
import { ServiceCategoryController } from '../../../../../src/endpoints/category/service/service-category.controller';
import { MockType } from '../../../mock';

describe('Service Category Controller Unit Tests', () => {
  const serviceCategoryServiceMockFactory: () => MockType<ServiceCategoryService> =
    jest.fn(() => ({
      getAll: jest.fn((entity) => entity),
    }));

  let serviceCategoryController: ServiceCategoryController;
  let serviceCategoryServiceMock: MockType<ServiceCategoryService>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceCategoryController,
        {
          provide: ServiceCategoryService,
          useFactory: serviceCategoryServiceMockFactory,
        },
      ],
    }).compile();
    serviceCategoryController = module.get(ServiceCategoryController);
    serviceCategoryServiceMock = module.get(ServiceCategoryService);
  });

  it('should be defined', () => {
    // Assert
    expect(serviceCategoryController).toBeDefined();
  });

  it('should find all categories', () => {
    // Arrange
    const categories = [
      {
        category: 'Example 1',
      },
      {
        category: 'Example 2',
      },
    ];
    serviceCategoryServiceMock.getAll.mockReturnValue(categories);

    // Assert
    expect(serviceCategoryController.getServiceCategory()).toEqual(categories);
    expect(serviceCategoryServiceMock.getAll).toHaveBeenCalled();
  });
});
