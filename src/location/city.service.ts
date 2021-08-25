import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/location/models/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CityService extends TypeOrmQueryService<City> {
  constructor(
    @InjectRepository(City, 'dbLocation')
    private readonly cityRepository: Repository<City>,
  ) {
    super(cityRepository)
  }

  getAllCity(country_code: string, state_code: string) {
    return this.cityRepository.find({
      where: { country_code, state_code },
    });
  }

  getOneCity(id: number) {
    return this.cityRepository.findOneOrFail(id);
  }
}
