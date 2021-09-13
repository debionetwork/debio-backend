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
<<<<<<< HEAD
    super(cityRepository)
=======
    super(cityRepository);
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
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
