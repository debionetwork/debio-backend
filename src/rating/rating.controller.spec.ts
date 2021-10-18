import { Test, TestingModule } from "@nestjs/testing";
import { CacheModule, CACHE_MANAGER } from '@nestjs/common';
import { getRepositoryToken } from "@nestjs/typeorm";
import { LabRating } from "./models/rating.entity";
import { RatingController } from "./rating.controller"
import { RatingService } from "./rating.service";
import { Cache } from "cache-manager";
import { async } from "rxjs";
import { id } from "@ethersproject/hash";

describe('Rating Controller', () => {
  let cacheManager: Cache;
  let ratingController: RatingController;

  const mockRatingService = {
    create: jest.fn( ratingDto => {
      return {
        id: Date.now(),
        ...ratingDto
      }
    }),
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

  it('should be post rating success', async () => {
    const ratingDto = {
      lab_id: '0x833j4j',
      service_id: '0xs89393',
      order_id: '0xj3mj4',
      rating_by: 'Jordan',
      rating: 4,
      created: new Date()
    }
    const postRating = await ratingController.create(ratingDto)
    expect(postRating).toHaveProperty('data', {
      id: expect.any(Number),
      ...ratingDto
    })
    expect(mockRatingService.create).toHaveBeenCalledWith(ratingDto)
  })
})