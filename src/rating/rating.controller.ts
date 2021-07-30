import { Body, Controller, Post } from "@nestjs/common";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { RatingService } from "./rating.service";

@Controller('labRating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  async create(@Body() data: CreateRatingDto) {
    console.log(data);
    
    return {
      data: await this.ratingService.create(data)
    }
  }

}