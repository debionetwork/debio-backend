import { Test, TestingModule } from "@nestjs/testing";
import { RatingController } from "./rating.controller"
import { RatingService } from "./rating.service";

describe('Rating Controller', () => {
  let ratingController: RatingController;

  const mockRatingService = {

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingController],
      providers: [RatingService],
    })
      .overrideProvider(RatingService)
      .useValue(mockRatingService)
      .compile();

    ratingController = module.get<RatingController>(RatingController)
  });

  it('should be defined', () => {
    expect(ratingController).toBeDefined();
  })

  it('should be ')
})