import { Test, TestingModule } from '@nestjs/testing';
import { DnaCollectionController } from '../../../../../src/endpoints/category/dna-collection/dna-collection.controller';
import { DnaCollectionService } from '../../../../../src/endpoints/category/dna-collection/dna-collection.service';
import { MockType } from '../../../mock';

describe('Specialization Controller Unit Tests', () => {
  const DnaCollectionServiceMockFactory: () => MockType<DnaCollectionService> =
    jest.fn(() => ({
      getAll: jest.fn((entity) => entity),
    }));

  let dnaCollectionController: DnaCollectionController;
  let specializationMock: MockType<DnaCollectionService>;

  //Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnaCollectionController,
        {
          provide: DnaCollectionService,
          useFactory: DnaCollectionServiceMockFactory,
        },
      ],
    }).compile();
    dnaCollectionController = module.get(DnaCollectionController);
    specializationMock = module.get(DnaCollectionService);
  });

  it('should be defined', () => {
    //Assert
    expect(dnaCollectionController).toBeDefined();
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
    expect(dnaCollectionController.getDnaCollectionCategory()).toEqual(
      categories,
    );
    expect(specializationMock.getAll).toHaveBeenCalled();
  });
});
