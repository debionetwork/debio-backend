import { Cache as CacheManager } from "cache-manager";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RatingService } from '../../../../src/endpoints/rating/rating.service';
import { LabRating } from '../../../../src/endpoints/rating/models/rating.entity';
import { MockType, cacheMockFactory, repositoryMockFactory } from '../../mock';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from "@nestjs/common";

describe('Rating Service Unit Tests', () => {
  let ratingService: RatingService;
  let cacheMock: MockType<CacheManager>;
  let repositoryMock: MockType<Repository<LabRating>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getRepositoryToken(LabRating), useFactory: repositoryMockFactory },
        { provide: CACHE_MANAGER, useFactory: cacheMockFactory },
      ],
    }).compile();

    ratingService = module.get(RatingService);
    cacheMock = module.get(CACHE_MANAGER);
    repositoryMock = module.get(getRepositoryToken(LabRating));
  });

  it('should be defined', () => {
    // Assert
    expect(ratingService).toBeDefined();
  });

//   it('should find one rating', () => {
//     // Arrange
//     const ID = 0;
//     const RESULTS = [
//       {
//         rating: 'Rating 1',
//       },
//       {
//         rating: 'Rating 2',
//       },
//     ];
//     repositoryMock.findOneOrFail.mockReturnValue(RESULTS);

//     // Assert
//     expect(ratingService.getOneRating(ID)).toEqual(RESULTS);
//     expect(repositoryMock.findOneOrFail).toHaveBeenCalledWith(ID);
//     expect(repositoryMock.findOneOrFail).toHaveBeenCalled();
//   });
});
