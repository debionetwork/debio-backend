import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRatingDto } from 'src/rating/dto/create-rating.dto';
import { LabRating } from 'src/rating/models/rating.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(LabRating)
    private readonly ratingRepository: Repository<LabRating>,
  ) {}

  create(data: CreateRatingDto) {
    const rating = new LabRating();
    rating.lab_id = data.lab_id;
    rating.service_id = data.service_id;
    rating.order_id = data.order_id;
    rating.rating_by = data.rating_by;
    rating.rating = data.rating;
    rating.created = data.created;
    return this.ratingRepository.save(rating);
  }

  getRatingByLabId(lab_id: string) {
    return this.ratingRepository.find({
      where: { lab_id },
    });
  }
}
