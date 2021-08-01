import { Controller, Get, Query } from '@nestjs/common';
import { CityService } from './city.service';
import { CountryService } from './country.service';
import { RegionService } from './region.service';

@Controller('location')
export class LocationController {
  constructor(
    private readonly countryService: CountryService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService,
  ) {}

  @Get()
  async getLocation(
    @Query('country_code') country_code: string,
    @Query('region_code') region_code: string,
    @Query('city_code') city_code: string,
  ) {
    let resLocation;

    if (city_code) {
      resLocation = await this.cityService.getOneCity(city_code);
      for (const key in resLocation) {
        resLocation[key] = resLocation[key].trim();
      }
    } else {
      if (region_code) {
        resLocation = await this.cityService.getAllCity(
          country_code,
          region_code,
        );
      } else if (country_code) {
        resLocation = await this.regionService.getAllRegion(country_code);
      } else {
        resLocation = await this.countryService.getAll();
      }
      resLocation.forEach((element) => {
        for (const key in element) {
          element[key] = element[key].trim();
        }
      });
    }
    return { status: 'ok', data: resLocation };
  }
}
