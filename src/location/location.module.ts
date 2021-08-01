import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { CountryService } from './country.service';
import { LocationController } from './location.controller';
import { City } from './models/city.entity';
import { Country } from './models/country.entity';
import { Region } from './models/region.entity';
import { RegionService } from './region.service';
// import dotenv from 'dotenv';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [TypeOrmModule.forFeature([Country, Region, City])],
  controllers: [LocationController],
  providers: [CountryService, RegionService, CityService],
  exports: [TypeOrmModule, RegionService, CityService],
})
export class LocationModule {}
