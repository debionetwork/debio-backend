import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { DebioConversionService } from 'src/common';

@Controller('conversion')
export class CacheController {
  constructor(
    private readonly debioConversionService: DebioConversionService,
  ) {}

  @Get('cache')
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getCache(@Query('from') from: string, @Query('to') to: string) {
    if (from && to) {
      const resultFromTo =
        await this.debioConversionService.processCacheConversionFromTo(
          from,
          to,
        );
      return {
        from: from,
        to: to,
        conversion: resultFromTo,
      };
    } else {
      const result = await this.debioConversionService.processCacheConversion();
      return result;
    }
  }
}
