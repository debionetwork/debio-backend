import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { allService, labRating, serviceLabRating } from './models/response';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { SentryInterceptor } from '../../common/interceptors';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingService } from './rating.service';

@UseInterceptors(SentryInterceptor)
@Controller('rating')
export class RatingController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly ratingService: RatingService,
  ) {}

  @Get('order/:order_id')
  @ApiParam({ name: 'order_id' })
  async getByCustomer(@Param('order_id') order_id: string) {
    return {
      data: await this.ratingService.getRatingByOrderId(order_id),
    };
  }

  @Post()
  @ApiBody({ type: CreateRatingDto })
  @ApiOperation({
    description: 'Customer give feedback or rating for lab service.',
  })
  @ApiResponse({ status: 201, type: CreateRatingDto })
  async create(@Body() data: CreateRatingDto, @Res() response: Response) {
    const isRatedByOrderId = await this.ratingService.getRatingByOrderId(
      data.order_id,
    );
    if (isRatedByOrderId) {
      return {
        message: "You've Rated Before",
      };
    }
    await this.cacheManager.del('getAllRating');
    await this.cacheManager.del('ratings');
    await this.cacheManager.del(data.service_id);
    try {
      return response.status(201).send(await this.ratingService.insert(data));
    } catch (error) {
      return response.status(500).send(error);
    }
  }

  @Get('service')
  @ApiOperation({
    description: 'Get number of ratings from all service and lab',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: allService,
    },
  })
  async getAllService(@Res() response: Response) {
    try {
      return response
        .status(200)
        .send(await this.ratingService.getAllByServiceId());
    } catch (error) {
      return response.status(500).send(error);
    }
  }

  @Get('service/:service_id')
  @ApiParam({ name: 'service_id' })
  @ApiOperation({ description: 'get number of ratings from service lab.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: serviceLabRating,
    },
  })
  async getByServiceId(
    @Param('service_id') service_id: string,
    @Res() response: Response,
  ) {
    return response
      .status(200)
      .send(await this.ratingService.getRatingByServiceId(service_id));
  }

  @Get('lab/:lab_id')
  @ApiParam({ name: 'lab_id' })
  @ApiOperation({ description: 'get number of ratings from lab.' })
  @ApiResponse({
    status: 200,
    schema: {
      example: labRating,
    },
  })
  async getLabRating(
    @Param('lab_id') labor_id: string,
    @Res() response: Response,
  ) {
    let cachingData = [];
    const valueCache = await this.cacheManager.get('ratings');

    if (valueCache) {
      cachingData = cachingData.concat(valueCache);
      const isCacheReady = cachingData.find(
        ({ lab_id }) => lab_id === labor_id,
      );

      if (isCacheReady) {
        return response.status(200).send(isCacheReady);
      }
    }
    const labRatings = await this.ratingService.getRatingByLabId(labor_id);
    const result = {
      lab_id: labor_id,
      rating: null,
      sum: null,
      count: labRatings.length,
    };

    if (labRatings.length > 0) {
      let labRatingCount = 0;
      labRatings.forEach((element) => {
        labRatingCount += element.rating;
      });
      result.rating = labRatingCount / labRatings.length;
      result.sum = labRatingCount;
    }
    cachingData.push(result);
    await this.cacheManager.set('ratings', cachingData, { ttl: 1800 });
    return response.status(200).send(result);
  }
}
