import { Cache as CacheManager } from "cache-manager";
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RatingService } from '../../../../src/endpoints/rating/rating.service';
import { LabRating } from '../../../../src/endpoints/rating/models/rating.entity';
import { MockType, cacheMockFactory, repositoryMockFactory, dateTimeProxyMockFactory } from '../../mock';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from "@nestjs/common";
import { CreateRatingDto } from "../../../../src/endpoints/rating/dto/create-rating.dto";
import { DateTimeProxy } from "../../../../src/common";

describe('Rating Service Unit Tests', () => {
  let ratingService: RatingService;
  let cacheMock: MockType<CacheManager>;
  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let repositoryMock: MockType<Repository<LabRating>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getRepositoryToken(LabRating), useFactory: repositoryMockFactory },
        { provide: CACHE_MANAGER, useFactory: cacheMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
      ],
    }).compile();

    ratingService = module.get(RatingService);
    cacheMock = module.get(CACHE_MANAGER);
    dateTimeProxyMock = module.get(DateTimeProxy);
    repositoryMock = module.get(getRepositoryToken(LabRating));
  });

  it('should be defined', () => {
    // Assert
    expect(ratingService).toBeDefined();
  });

  it('should insert', async () => {
    // Arrange
    const CURRENT_DATE = new Date();
    const EXPECTED_RESULTS = 0;

    const PARAM = new CreateRatingDto();
    PARAM.lab_id = "LAB_ID";
    PARAM.service_id = "SERVICE_ID";
    PARAM.order_id = "ORDER_ID";
    PARAM.rating_by = "RATING_BY";
    PARAM.rating = 0;

    const EXPECTED_PARAM = new LabRating();
    EXPECTED_PARAM.lab_id = PARAM.lab_id;
    EXPECTED_PARAM.service_id = PARAM.service_id;
    EXPECTED_PARAM.order_id = PARAM.order_id;
    EXPECTED_PARAM.rating_by = PARAM.rating_by;
    EXPECTED_PARAM.rating = PARAM.rating;
    EXPECTED_PARAM.created = CURRENT_DATE;

    dateTimeProxyMock.new.mockReturnValue(CURRENT_DATE);
    repositoryMock.save.mockReturnValue(EXPECTED_RESULTS);

    // Act
    const RESULTS = await ratingService.insert(PARAM);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(cacheMock.del).toHaveBeenCalledTimes(2);
    expect(cacheMock.del).toHaveBeenCalledWith('getAllRating');
    expect(cacheMock.del).toHaveBeenCalledWith(PARAM.service_id);
    expect(repositoryMock.save).toHaveBeenCalled();
    expect(repositoryMock.save).toHaveBeenCalledWith(EXPECTED_PARAM);
  });
});
