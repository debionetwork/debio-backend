import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingService } from './rating.service';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async create(@Body() data: CreateRatingDto) {
    console.log(data);

    return {
      data: await this.ratingService.create(data),
    };
  }

  @Get(':lab_id')
  async getLabRating(@Param('lab_id') lab_id: string) {
    const labRatings = await this.ratingService.getRatingByLabId(lab_id);

    const responce = {
      lab_id,
      rating: null,
    };

    if (labRatings.length > 0) {
      let labRatingCount = 0;
      labRatings.forEach((element) => {
        labRatingCount += element.rating;
      });
      responce.rating = labRatingCount / labRatings.length;
    }

    return { status: 'ok', data: responce };
  }
}
