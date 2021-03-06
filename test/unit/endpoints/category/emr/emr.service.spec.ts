import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmrService } from '../../../../../src/endpoints/category/emr/emr.service';
import { EmrCategory } from '../../../../../src/endpoints/category/emr/models/emr.entity';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';

describe('Emr Service Unit Tests', () => {
  let emrService: EmrService;
  let repositoryMock: MockType<Repository<EmrCategory>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmrService,
        {
          provide: getRepositoryToken(EmrCategory),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    emrService = module.get(EmrService);
    repositoryMock = module.get(getRepositoryToken(EmrCategory));
  });

  it('should be defined', () => {
    // Assert
    expect(emrService).toBeDefined();
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
    repositoryMock.find.mockReturnValue(categories);

    // Assert
    expect(emrService.getAll()).toEqual(categories);
    expect(repositoryMock.find).toHaveBeenCalled();
  });
});
