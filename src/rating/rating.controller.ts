import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingService } from './rating.service';

@Controller('rating')
export class RatingController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ratingService: RatingService,
  ) {}

  @Post()
  @ApiBody({ type: CreateRatingDto })
  async create(@Body() data: CreateRatingDto) {
    await this.cacheManager.del('ratings');
    return {
      data: await this.ratingService.create(data),
    };
  }

  @Get(':lab_id')
  async getLabRating(@Param('lab_id') labor_id: string) {
    let cachingData = [];
    const valueCache = await this.cacheManager.get('ratings');

    if (valueCache) {
      cachingData = cachingData.concat(valueCache);
      const isCacheReady = cachingData.find(
        ({ lab_id }) => lab_id === labor_id,
      );

      if (isCacheReady) {
        return { status: 'ok', data: isCacheReady };
      }
    }
    const labRatings = await this.ratingService.getRatingByLabId(labor_id);
    const response = {
      lab_id: labor_id,
      rating: null,
    };

    if (labRatings.length > 0) {
      let labRatingCount = 0;
      labRatings.forEach((element) => {
        labRatingCount += element.rating;
      });
      response.rating = labRatingCount / labRatings.length;
    }
    cachingData.push(response);
    await this.cacheManager.set('ratings', cachingData, { ttl: 1800 });
    return { status: 'ok', data: response };
  }
}
