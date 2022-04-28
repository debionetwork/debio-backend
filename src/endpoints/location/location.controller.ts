import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SentryInterceptor } from '../../common/interceptors';
import { CityService } from './city.service';
import { CountryService } from './country.service';
import { StateService } from './state.service';
import { locationResponse } from './models/response';

@UseInterceptors(SentryInterceptor)
@Controller('location')
export class LocationController {
  constructor(
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private readonly cityService: CityService,
  ) {}

  @Get()
  @ApiOperation({ 
    description: `Get list of Location : country, region, or city.\n
    description: \n
    1. { country_code: null, state_code: null, city_code: null }                 : then will get response data list of county. \n
    2. { country_code: <country_code>, state_code: null, city_code: null }       : then will get response data list of state.\n
    3. { country_code: <coutry_code>, state_code: <state_code>, city_code: null }: then will get response data list of city_code.\n
    4. { country_code: null, state_code: null, city_code: <city_code> }          : then will get response data of city.`,
  })
  @ApiResponse({
    description: 'List of location',
    schema: { example: locationResponse }
  })
  @ApiQuery({ name: 'country_code', required: false })
  @ApiQuery({ name: 'state_code', required: false })
  @ApiQuery({ name: 'city_id', required: false })
  async getLocation(
    @Query('country_code') country_code: string,
    @Query('state_code') state_code: string,
    @Query('city_id') city_id: number,
  ) {
    let resLocation;

    if (city_id) {
      resLocation = await this.cityService.getOneCity(city_id);
      resLocation['name'] = resLocation['name'].trim();
    } else {
      if (state_code) {
        resLocation = await this.cityService.getAllCity(
          country_code,
          state_code,
        );
      } else if (country_code) {
        resLocation = await this.stateService.getAllRegion(country_code);
      } else {
        resLocation = await this.countryService.getAll();
      }
      resLocation.forEach((element) => {
        element['name'] = element['name'].trim();
      });
    }
    return { status: 'ok', data: resLocation };
  }
}
