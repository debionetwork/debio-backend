import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { DbioBalanceService } from './dbio_balance.service';
import { DbioBalanceDto } from './dto/dbio_balance.dto';

@Controller('set-dbio-balance')
export class DbioBalanceController {
  constructor(private readonly dbioBalanceService: DbioBalanceService) {}

  @Get()
  async getDebioBalance() {
    try {
      return await this.dbioBalanceService.getDebioBalance();
    } catch (error) {
      return { error };
    }
  }

  @Post()
  @ApiBody({ type: DbioBalanceDto })
  async setDbioToDai(@Body() data: DbioBalanceDto) {
    try {
      return {
        data: await this.dbioBalanceService.setDbioToDai(data),
      };
    } catch (error) {}
  }
}
