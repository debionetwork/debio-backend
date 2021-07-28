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

require('dotenv').config()
// dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_POSTGRES,
      port: 5432,
      username: process.env.USERNAME_POSTGRES,
      password: process.env.PASSWORD_POSTGRES,
      database: process.env.DB_POSTGRES,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Country, Region, City]),
  ],
  controllers: [LocationController],
  providers: [CountryService, RegionService, CityService],
})
export class LocationModule {}
