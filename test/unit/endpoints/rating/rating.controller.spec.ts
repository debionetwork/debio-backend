import { Test, TestingModule } from '@nestjs/testing';
import { Cache as CacheManager } from "cache-manager";
import { CACHE_MANAGER } from '@nestjs/common';
import { Response } from 'express';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LabRating } from '../../../../src/endpoints/rating/models/rating.entity';
import { RatingController } from '../../../../src/endpoints/rating/rating.controller';
import { RatingService } from '../../../../src/endpoints/rating/rating.service';
import { cacheMockFactory, dateTimeProxyMockFactory, MockType, repositoryMockFactory } from '../../mock';
import { DateTimeProxy } from '../../../../src/common';
import { Repository } from 'typeorm';
import { CreateRatingDto } from '../../../../src/endpoints/rating/dto/create-rating.dto';

describe('Rating Controller', () => {
  let ratingController: RatingController;
  let ratingServiceMock: MockType<RatingService>;
  let cacheMock: MockType<CacheManager>;

  const ratingServiceMockFactory: () => MockType<RatingService> = jest.fn(
    () => ({
      insert: jest.fn(),
      getAllByServiceId: jest.fn(),
      getRatingByLabId: jest.fn(),
      getRatingByServiceId: jest.fn(),
      getRatingByOrderId: jest.fn(),
    }),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingController,
        { provide: RatingService, useFactory: ratingServiceMockFactory },
        { provide: getRepositoryToken(LabRating), useFactory: repositoryMockFactory },
        { provide: CACHE_MANAGER, useFactory: cacheMockFactory },
        { provide: DateTimeProxy, useFactory: dateTimeProxyMockFactory },
      ],
    }).compile();

    ratingController = module.get<RatingController>(RatingController);
    ratingServiceMock = module.get(RatingService);
    cacheMock = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(ratingController).toBeDefined();
  });

  it('should get rating by order Id', async () => {
    // Arrange
    const MOCK_RESULT = 0;
    const ORDER_ID = "ORDER_ID";
    const EXPECTED_RESULTS = {
      data: MOCK_RESULT,
    };

    ratingServiceMock.getRatingByOrderId.mockReturnValue(MOCK_RESULT);

    // Act
    const RESULTS = await ratingController.getByCustomer(ORDER_ID);

    // Assert
    expect(RESULTS).toEqual(EXPECTED_RESULTS);
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenCalled();
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenCalledWith(ORDER_ID);
  });

  it('should get rating by service Id', async () => {
    // Arrange
    const MOCK_RESULT = 0;
    const SERVICE_ID = "SERVICE_ID";
    const EXPECTED_RESULTS = {
      data: MOCK_RESULT,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;

    ratingServiceMock.getRatingByServiceId.mockReturnValue(MOCK_RESULT);

    // Assert
    expect(await ratingController.getByServiceId(SERVICE_ID, RESPONSE)).toBe(EXPECTED_RESULTS);
    expect(ratingServiceMock.getRatingByServiceId).toHaveBeenCalled();
    expect(ratingServiceMock.getRatingByServiceId).toHaveBeenCalledWith(SERVICE_ID);
  });

  it('should get all rating by service Id', async () => {
    // Arrange
    const MOCK_RESULT = 0;
    const EXPECTED_RESULTS = {
      data: MOCK_RESULT,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;

    ratingServiceMock.getAllByServiceId.mockReturnValue(MOCK_RESULT);

    // Assert
    expect(await ratingController.getAllService(RESPONSE)).toBe(EXPECTED_RESULTS);
    expect(ratingServiceMock.getAllByServiceId).toHaveBeenCalled();
  });

  it('should throw when get all rating by service Id', async () => {
    // Arrange
    const EXPECTED_RESULTS = 0;
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;

    ratingServiceMock.getAllByServiceId.mockImplementationOnce(() =>
      Promise.reject(EXPECTED_RESULTS),
    );

    // Assert
    expect(await ratingController.getAllService(RESPONSE)).toBe(EXPECTED_RESULTS);
    expect(ratingServiceMock.getAllByServiceId).toHaveBeenCalled();
  });

  it('should send message and not create', async () => {
    // Arrange
    const PARAM = new CreateRatingDto();
    PARAM.order_id = "ORDER_ID";
    const MOCK_RESULT = 1;
    const EXPECTED_RESULTS = {
      message: "You've Rated Before",
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;
    ratingServiceMock.getRatingByOrderId.mockReturnValue(MOCK_RESULT);

    // Assert
    expect(await ratingController.create(PARAM, RESPONSE)).toEqual(EXPECTED_RESULTS);
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenCalled();
    expect(cacheMock.del).toHaveBeenCalledTimes(0);
    expect(ratingServiceMock.insert).toHaveBeenCalledTimes(0);
  });

  it('should insert', async () => {
    // Arrange
    const PARAM = new CreateRatingDto();
    PARAM.service_id = "SERVICE_ID";
    PARAM.order_id = "ORDER_ID";
    const EXPECTED_RESULTS = {
      data: 0,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;
    ratingServiceMock.getRatingByOrderId.mockReturnValue(false);
    ratingServiceMock.insert.mockReturnValue(EXPECTED_RESULTS);

    // Assert
    expect(await ratingController.create(PARAM, RESPONSE)).toEqual(EXPECTED_RESULTS);
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenCalled();
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenLastCalledWith(PARAM.order_id);
    expect(cacheMock.del).toHaveBeenCalledTimes(3);
    expect(cacheMock.del).toHaveBeenCalledWith('getAllRating');
    expect(cacheMock.del).toHaveBeenCalledWith('ratings');
    expect(cacheMock.del).toHaveBeenCalledWith(PARAM.service_id);
    expect(ratingServiceMock.insert).toHaveBeenCalled();
    expect(ratingServiceMock.insert).toHaveBeenCalledWith(PARAM);
  });

  it('should throw and not insert', async () => {
    // Arrange
    const PARAM = new CreateRatingDto();
    PARAM.service_id = "SERVICE_ID";
    PARAM.order_id = "ORDER_ID";
    const EXPECTED_RESULTS = {
      data: 0,
    };
    const RESPONSE: Response = {
      send: (body?: any): any => EXPECTED_RESULTS,
      status: (code: number) => RESPONSE,
    } as Response;
    ratingServiceMock.getRatingByOrderId.mockReturnValue(false);
    ratingServiceMock.insert.mockImplementationOnce(() =>
      Promise.reject(EXPECTED_RESULTS),
    );

    // Assert
    expect(await ratingController.create(PARAM, RESPONSE)).toEqual(EXPECTED_RESULTS);
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenCalled();
    expect(ratingServiceMock.getRatingByOrderId).toHaveBeenLastCalledWith(PARAM.order_id);
    expect(cacheMock.del).toHaveBeenCalledTimes(3);
    expect(cacheMock.del).toHaveBeenCalledWith('getAllRating');
    expect(cacheMock.del).toHaveBeenCalledWith('ratings');
    expect(cacheMock.del).toHaveBeenCalledWith(PARAM.service_id);
    expect(ratingServiceMock.insert).toHaveBeenCalled();
    expect(ratingServiceMock.insert).toHaveBeenCalledWith(PARAM);
  });
});
