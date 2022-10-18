import { Controller, Get, Query } from '@nestjs/common';
import { DebioConversionService } from 'src/common';

@Controller('conversion')
export class CacheController {
  constructor(private readonly debioConversionService: DebioConversionService) {}

  @Get("cache")
  async getCache(@Query('from') from: string, @Query('to') to: string) {
    if (from && to) {
      const resultFromTo = this.debioConversionService.processCacheConversionFromTo(from, to);
      return resultFromTo;
    } else {
      const result = this.debioConversionService.processCacheConversion();
      return result;
    }
  }
}