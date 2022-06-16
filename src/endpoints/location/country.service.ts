import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Country } from './models/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country, 'dbLocation')
    private readonly countryRepository: Repository<Country>,
  ) {}

  async getAll() {
    return await this.countryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async getByIso2Code(iso2: string) {
    const res = await this.countryRepository.findOne({
      where: { iso2 },
    });

    if (!res) {
      return {
        iso2,
        name: iso2,
      };
    }
    return res;
  }
}
