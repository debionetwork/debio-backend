import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { CountryService } from './country.service';
import { LocationController } from './location.controller';
import { City } from './models/city.entity';
import { Country } from './models/country.entity';
import { State } from './models/state.entity';
import { StateService } from './state.service';
// import dotenv from 'dotenv';

require('dotenv').config(); // eslint-disable-line
// dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([Country, State, City], 'dbLocation')],
  controllers: [LocationController],
  providers: [CountryService, StateService, CityService],
  exports: [TypeOrmModule,CountryService, StateService, CityService],
})
export class LocationModule {}
