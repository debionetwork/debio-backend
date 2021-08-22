import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLabRequestDto } from 'src/lab-request/dto/create_lab_request.dto';
import { LabRequest } from 'src/lab-request/models/lab_request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(LabRequest)
    private readonly ratingRepository: Repository<LabRequest>,
  ) {}

  create(data: CreateLabRequestDto) {
    const today = new Date();
    const timeNowStr =
      today.getDate() + '/' + today.getMonth() + '/' + today.getFullYear();

    const rating = new LabRequest();
    rating.account_id = data.account_id;
    rating.country_code = data.country_code;
    rating.regional_code = data.regional_code;
    rating.city_code = data.city_code;
    rating.name = data.name;
    rating.address = data.address;
    rating.service = data.service;
    rating.create_at = timeNowStr;
    return this.ratingRepository.save(rating);
  }

  getRatingByLabId(lab_id: string) {
    return this.ratingRepository.find({
      where: { lab_id },
    });
  }
}
