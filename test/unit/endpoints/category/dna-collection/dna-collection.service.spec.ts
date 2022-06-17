import { DnaCollectionCategory } from '../../../../../src/endpoints/category/dna-collection/models/dna-collection.entity';
import { MockType, repositoryMockFactory } from '../../../mock';
import { Repository } from 'typeorm';
import { DnaCollectionService } from '../../../../../src/endpoints/category/dna-collection/dna-collection.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Dna Collection Service Unit Tests', () => {
  let dnaCollectionService: DnaCollectionService;
  let repositoryMock: MockType<Repository<DnaCollectionCategory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DnaCollectionService,
        {
          provide: getRepositoryToken(DnaCollectionCategory),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    dnaCollectionService = module.get(DnaCollectionService);
    repositoryMock = module.get(getRepositoryToken(DnaCollectionCategory));
  });

  it('shoud be defined', () => {
    //Assert
    expect(dnaCollectionService).toBeDefined();
  });

  it('shoud find all categories', () => {
    //Arrange

    const categories = [
      {
        name: 'Example 1',
        collectionProcces: 'example 1'
      },
      {
        name: 'Example 2',
        collectionProcces: 'example 2'
      },
    ];
    repositoryMock.find.mockReturnValue(categories);

    //Assert
    expect(dnaCollectionService.getAll()).toEqual(categories);
    expect(repositoryMock.find).toHaveBeenCalled();
  });
});
