import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(readonly orderService: OrderService) {}

  // host/{customer_id}?query=&page=&size=
  @Get(':customer_id')
  @ApiParam({ name: 'customer_id'})
  @ApiQuery({ name: 'keyword'})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
  async getOrderByProductNameStatusLabName(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ): Promise<any> {
    const orders = await this.orderService.getByProductNameStatusLabName(
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      page,
      size,
    );
    
    return orders;
  }
}
