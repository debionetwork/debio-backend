import { Test, TestingModule } from "@nestjs/testing";
import { CacheModule, CACHE_MANAGER } from '@nestjs/common';
import { getRepositoryToken } from "@nestjs/typeorm";
import { LabRating } from "./models/rating.entity";
import { RatingController } from "./rating.controller"
import { RatingService } from "./rating.service";
import { Cache } from "cache-manager";

describe('Rating Controller', () => {
  let cacheManager: Cache;
  let ratingController: RatingController;

  const mockRatingService = {
    create: jest.fn( ratingDto => {
      return {
        id: Date.now(),
        ...ratingDto
      }
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [RatingController],
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(LabRating),
          useValue: {}
        }
      ],
    })
      .overrideProvider(RatingService)
      .useValue(mockRatingService)
      .compile();

    ratingController = module.get<RatingController>(RatingController)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  });

  it('should be defined', () => {
    expect(ratingController).toBeDefined();
  })

  it('should be post rating success', () => {
    const ratingDto = {
      lab_id: '0x833j4j',
      service_id: '0xs89393',
      order_id: '0xj3mj4',
      rating_by: 'Jordan',
      rating: 4,
      created: new Date()
    }
    expect(ratingController.create(ratingDto)).toEqual({
      id: expect.any(Number),
      lab_id: ratingDto.lab_id,
      service_id: ratingDto.service_id,
      order_id: ratingDto.order_id,
      rating_by: ratingDto.rating_by,
      rating: ratingDto.rating,
      created: ratingDto.created
    })

    expect(mockRatingService.create).toHaveBeenCalledWith(ratingDto)
  })
})