import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/model/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City) private readonly cityRepository: Repository<City>,
  ) {}

  getAllCity(country_code: string, region_code: string) {
    return this.cityRepository.find({
      where: { country_code, region_code },
    });
  }

  getOneCity(city_code: string) {
    return this.cityRepository.findOneOrFail(city_code);
  }
}
