import { Controller, Get, Query } from "@nestjs/common";
import { CityService } from "src/services/city.service";
import { CountryService } from "src/services/country.service";
import { RegionService } from "src/services/region.service";

@Controller('location')
export class LocationController{
  constructor(
    private readonly countryService: CountryService,
    private readonly regionService: RegionService,
    private readonly cityService: CityService
    ) {}
  
  @Get()
  async getLocation(
    @Query('country_code') country_code:string,
    @Query('region_code') region_code: string,
    @Query('city_code') city_code: string) {

    if (city_code) {
      return { status: "ok", data: await this.cityService.getOneCity(city_code)}
    } else if (region_code) {
        return { status: "ok", data: await this.cityService.getAllCity(country_code, region_code) }
    } else if(country_code){
        return { status: "ok", data: await this.regionService.getAllRegion(country_code) }
    } else {
        return { status: "ok", data: await this.countryService.getAll() }
    }
  }
}