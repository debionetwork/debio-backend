import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './models/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City, 'dbLocation')
    private readonly cityRepository: Repository<City>,
  ) {}

  getAllCity(country_code: string, state_code: string) {
    return this.cityRepository.find({
      where: { country_code, state_code },
      order: {
        name: 'ASC',
      },
    });
  }

  getOneCity(id: number) {
    return this.cityRepository.findOneOrFail({
      where: { id: id },
    });
  }
}
