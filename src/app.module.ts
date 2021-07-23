import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './controllers/api/location.controller';
import { City } from './model/database/city.entity';
import { Country } from './model/database/country.entity';
import { Region } from './model/database/region.entity';
import { CityService } from './services/database/city.service';
import { CountryService } from './services/database/country.service';
import { RegionService } from './services/database/region.service';

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
export class AppModule {}
