import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(readonly orderService: OrderService) {}
  
  // host/{hash_id}
  @Get(':hash_id')
  async getOrderById(
    @Param('hash_id') hashId: string,
  ) {
    const order = await this.orderService.getOrderByHashId(hashId);

    return order;
  }

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
  ) {
    const orders = await this.orderService.getOrderList(
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      page,
      size,
    );
    
    return orders;
  }
}
