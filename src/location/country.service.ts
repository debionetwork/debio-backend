import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Country } from './models/country.entity';

@Injectable()
export class CountryService extends TypeOrmQueryService<Country> {
  constructor(
    @InjectRepository(Country, 'dbLocation')
    private readonly countryRepository: Repository<Country>,
  ) {
<<<<<<< HEAD
    super(countryRepository)
=======
    super(countryRepository);
>>>>>>> 21b18fa13c70567207df7fab20e8cc8e384143ec
  }

  getAll() {
    return this.countryRepository.find();
  }

  async getByIso2Code(iso2: string) {
    return this.countryRepository.findOne({
      where: { iso2 },
    });
  }
}
