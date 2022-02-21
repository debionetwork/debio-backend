import { SpecializationCategory } from '../../../../../src/endpoints/category/specialization/models/specialization.entity';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';
import { SpecializationService } from '../../../../../src/endpoints/category/specialization/specialization.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Specialization Service Unit Tests', () => {
  let specializationService: SpecializationService;
  let repositoryMock: MockType<Repository<SpecializationCategory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecializationService,
        {
          provide: getRepositoryToken(SpecializationCategory),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    specializationService = module.get(SpecializationService);
    repositoryMock = module.get(getRepositoryToken(SpecializationCategory));
  });

  it('shoud be defined', () => {
    //Assert
    expect(specializationService).toBeDefined();
  });

  it('shoud find all categories', () => {
    //Arrange

    const categories = [
      {
        category: 'Example 1',
      },
      {
        category: 'Example 2',
      },
    ];
    repositoryMock.find.mockReturnValue(categories);

    //Assert
    expect(specializationService.getAll()).toEqual(categories);
    expect(repositoryMock.find).toHaveBeenCalled();
  });
});
