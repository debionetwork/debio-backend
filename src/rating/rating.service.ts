import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CreateRatingDto } from 'src/rating/dto/create-rating.dto';
import { LabRating } from './models/rating.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(LabRating)
    private readonly ratingRepository: Repository<LabRating>,
  ) {}

  insert(data: CreateRatingDto) {
    const rating = new LabRating();
    rating.lab_id = data.lab_id;
    rating.service_id = data.service_id;
    rating.order_id = data.order_id;
    rating.rating_by = data.rating_by;
    rating.rating = data.rating;
    rating.created = data.created;

    return this.ratingRepository.save(rating);
  }

  async getAllByServiceId(service_id){
    const cacheAllRating = await this.cacheManager.get('getAllRating')
    let ratings = null

    if(cacheAllRating){
      ratings = cacheAllRating
    } else {
      ratings = await this.ratingRepository.find()
      await this.cacheManager.set('getAllRating', ratings, { ttl: 3600 });
    }
    let result = {}

    ratings.forEach(data => {
      if(!result[`${data.lab_id}`]){
          result[`${data.lab_id}`] = {
          lab_id: data.lab_id,
          count_rating_lab: 0,
          sum_rating_lab: 0,
          rating_lab: null,
          services: {}
        }
      }

      if(!result[`${data.lab_id}`]['services'][data.service_id]){
        result[`${data.lab_id}`]['services'][data.service_id] = {
          service_id: data.service_id,
          sum_rating_service: 0,
          count_rating_service: 0,
          rating_service: null
        }
      }

      result[`${data.lab_id}`].count_rating_lab += 1      
      result[`${data.lab_id}`].sum_rating_lab += data.rating      
      result[`${data.lab_id}`].rating_lab = result[`${data.lab_id}`].sum_rating_lab / result[`${data.lab_id}`].count_rating_lab

      result[`${data.lab_id}`]['services'][
        data.service_id].count_rating_service += 1
        
      result[`${data.lab_id}`]['services'][
        data.service_id].sum_rating_service += data.rating

        result[`${data.lab_id}`]['services'][
          data.service_id].rating_service = result[`${data.lab_id}`]['services'][
            data.service_id].sum_rating_service / result[`${data.lab_id}`]['services'][
              data.service_id].count_rating_service      
    });

    return result
  }

  getRatingByLabId(lab_id: string) {
    return this.ratingRepository.find({
      where: { lab_id },
    });
  }

  getRatingByServiceId(service_id: string) {
    return this.ratingRepository.find({
      where: { service_id },
    });
  }

  getRatingByOrderId(order_id: string) {
    return this.ratingRepository.findOne({ where: { order_id }})
  }
}