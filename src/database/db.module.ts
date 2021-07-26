import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { City } from './model/city.entity';
import { Country } from './model/country.entity';
import { Region } from './model/region.entity';
import { CityService } from './city.service';
import { CountryService } from './country.service';
import { RegionService } from './region.service';

require('dotenv').config(); // eslint-disable-line
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
export class DBModule {}
