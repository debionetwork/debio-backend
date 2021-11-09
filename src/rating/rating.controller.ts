import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingService } from './rating.service';

@Controller('rating')
export class RatingController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ratingService: RatingService,
  ) {}

  @Get('order/:order_id')
  @ApiParam({ name: 'order_id'})
  async getByCustomer(@Param('order_id') order_id: string) {
    return {
      data: await this.ratingService.getRatingByOrderId(order_id)
    }
  }

  @Post()
  @ApiBody({ type: CreateRatingDto })
  async create(@Body() data: CreateRatingDto) {
    const isRatedByOrderId = await this.ratingService.getRatingByOrderId(data.order_id)
    if(isRatedByOrderId){
      return {
        message : "You've Rated Before"
      }
    }
    await this.cacheManager.del('getAllRating');
    await this.cacheManager.del('ratings');
    return {
      data: await this.ratingService.insert(data),
    };
  }

  @Get('service')
  async getAllService(
    @Res() response: Response
    ) {
    try {
      response.status(200).send(await this.ratingService.getAllByServiceId())
    } catch (error) {
      response.status(500).send(error)
    }
  }

  @Get('service/:service_id')
  async getByServiceId() {
  
  }

  @Get('lab/:lab_id')
  @ApiParam({ name: 'lab_id'})
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
