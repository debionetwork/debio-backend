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

  it('should get rating by lab Id', () => {
    // Arrange
    const EXPECTED_RESULTS = 0;
    const LAB_ID = "LAB_ID"
    const EXPECTED_PARAM = {
        where: {
            lab_id: LAB_ID
        }
    }

    repositoryMock.find.mockReturnValue(EXPECTED_RESULTS);

    // Act
    const RESULTS = ratingService.getRatingByLabId(LAB_ID);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(repositoryMock.find).toHaveBeenCalled();
    expect(repositoryMock.find).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should get rating by order Id', () => {
    // Arrange
    const EXPECTED_RESULTS = 0;
    const ORDER_ID = "ORDER_ID"
    const EXPECTED_PARAM = {
        where: {
            order_id: ORDER_ID
        }
    }

    repositoryMock.findOne.mockReturnValue(EXPECTED_RESULTS);

    // Act
    const RESULTS = ratingService.getRatingByOrderId(ORDER_ID);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(repositoryMock.findOne).toHaveBeenCalled();
    expect(repositoryMock.findOne).toHaveBeenCalledWith(EXPECTED_PARAM);
  });

  it('should get rating by service Id from cache', async () => {
    // Arrange
    const MOCK_RESULTS = [
        {
           rating: 5,
        }
    ];
    const SERVICE_ID = "SERVICE_ID";
    const EXPECTED_RESULTS = {
        service_id: SERVICE_ID,
        rating_service: null,
        sum_rating_service: MOCK_RESULTS[0].rating,
        count_rating_service: MOCK_RESULTS.length,
    };
    EXPECTED_RESULTS.rating_service = EXPECTED_RESULTS.sum_rating_service / EXPECTED_RESULTS.count_rating_service;

    cacheMock.get.mockReturnValue(MOCK_RESULTS);

    // Act
    const RESULTS = await ratingService.getRatingByServiceId(SERVICE_ID);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(cacheMock.get).toHaveBeenCalled();
    expect(cacheMock.get).toHaveBeenCalledWith(SERVICE_ID);
    expect(cacheMock.set).toHaveBeenCalledTimes(0);
    expect(repositoryMock.find).toHaveBeenCalledTimes(0);
  });

  it('should get rating by service Id', async () => {
    // Arrange
    const MOCK_RESULTS = [
        {
           rating: 5,
        }
    ];
    const SERVICE_ID = "SERVICE_ID";
    const EXPECTED_RESULTS = {
        service_id: SERVICE_ID,
        rating_service: null,
        sum_rating_service: MOCK_RESULTS[0].rating,
        count_rating_service: MOCK_RESULTS.length,
    };
    EXPECTED_RESULTS.rating_service = EXPECTED_RESULTS.sum_rating_service / EXPECTED_RESULTS.count_rating_service;

    const EXPECTED_PARAM = {
        where: {
            service_id: SERVICE_ID
        }
    }

    cacheMock.get.mockReturnValue(false);
    repositoryMock.find.mockReturnValue(MOCK_RESULTS);

    // Act
    const RESULTS = await ratingService.getRatingByServiceId(SERVICE_ID);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(cacheMock.get).toHaveBeenCalled();
    expect(cacheMock.get).toHaveBeenCalledWith(SERVICE_ID);
    expect(repositoryMock.find).toHaveBeenCalled();
    expect(repositoryMock.find).toHaveBeenCalledWith(EXPECTED_PARAM);
    expect(cacheMock.set).toHaveBeenCalled();
    expect(cacheMock.set).toHaveBeenCalledWith(SERVICE_ID, MOCK_RESULTS, { ttl: 3600 });
  });

  it('should get all ratings by service Id', async () => {
    // Arrange
    const LAB_ID = "LAB_ID";
    const SERVICE_ID = "SERVICE_ID";
    const MOCK_RESULTS = [
        {
            lab_id: LAB_ID,
            service_id: SERVICE_ID,
            rating: 5,
        }
    ];

    const EXPECTED_RESULTS = [
        {
           count_rating_lab: MOCK_RESULTS.length,
           lab_id: LAB_ID,
           rating_lab: MOCK_RESULTS[0].rating,
           services: [
              {
                 count_rating_service: MOCK_RESULTS.length,
                 rating_service: MOCK_RESULTS[0].rating,
                 service_id: SERVICE_ID,
                 sum_rating_service: MOCK_RESULTS[0].rating
              }
           ],
           sum_rating_lab: MOCK_RESULTS[0].rating
        }
    ];

    cacheMock.get.mockReturnValue(MOCK_RESULTS);

    // Act
    const RESULTS = await ratingService.getAllByServiceId();

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(cacheMock.get).toHaveBeenCalled();
    expect(cacheMock.get).toHaveBeenCalledWith('getAllRating');
    expect(cacheMock.set).toHaveBeenCalledTimes(0);
    expect(repositoryMock.find).toHaveBeenCalledTimes(0);
  });

  it('should get all ratings by service Id', async () => {
    // Arrange
    const LAB_ID = "LAB_ID";
    const SERVICE_ID = "SERVICE_ID";
    const MOCK_RESULTS = [
        {
            lab_id: LAB_ID,
            service_id: SERVICE_ID,
            rating: 5,
        }
    ];

    const EXPECTED_RESULTS = [
        {
           count_rating_lab: MOCK_RESULTS.length,
           lab_id: LAB_ID,
           rating_lab: MOCK_RESULTS[0].rating,
           services: [
              {
                 count_rating_service: MOCK_RESULTS.length,
                 rating_service: MOCK_RESULTS[0].rating,
                 service_id: SERVICE_ID,
                 sum_rating_service: MOCK_RESULTS[0].rating
              }
           ],
           sum_rating_lab: MOCK_RESULTS[0].rating
        }
    ];

    cacheMock.get.mockReturnValue(false);
    repositoryMock.find.mockReturnValue(MOCK_RESULTS);

    // Act
    const RESULTS = await ratingService.getAllByServiceId();

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(cacheMock.get).toHaveBeenCalled();
    expect(cacheMock.get).toHaveBeenCalledWith('getAllRating');
    expect(repositoryMock.find).toHaveBeenCalled();
    expect(cacheMock.set).toHaveBeenCalled();
    expect(cacheMock.set).toHaveBeenCalledWith('getAllRating', MOCK_RESULTS, { ttl: 3600 });
  });
});
