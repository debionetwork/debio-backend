import { Test, TestingModule } from '@nestjs/testing';
import { SpecializationController } from '../../../../../src/endpoints/category/specialization/specialization.controller';
import { SpecializationService } from '../../../../../src/endpoints/category/specialization/specialization.service';
import { MockType } from '../../../mock';

describe('Specialization Controller Unit Tests', () => {
  const specializationServiceMockFactory: () => MockType<SpecializationService> =
    jest.fn(() => ({
      getAll: jest.fn((entity) => entity),
    }));

  let specializationController: SpecializationController;
  let specializationMock: MockType<SpecializationService>;

  //Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecializationController,
        {
          provide: SpecializationService,
          useFactory: specializationServiceMockFactory,
        },
      ],
    }).compile();
    specializationController = module.get(SpecializationController);
    specializationMock = module.get(SpecializationService);
  });

  it('should be defined', () => {
    //Assert
    expect(specializationController).toBeDefined();
  });

  it('should find all categories', () => {
    //Arrange
    const categories = [
      {
        category: 'Example 1',
      },
      {
        category: 'Example 2',
      },
    ];
    specializationMock.getAll.mockReturnValue(categories);

    //Assert
    expect(specializationController.getSpecializationCategory()).toEqual(
      categories,
    );
    expect(specializationMock.getAll).toHaveBeenCalled();
  });
});
