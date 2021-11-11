import { Controller, Get, HttpException, HttpStatus, Param, Query, Req } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(readonly orderService: OrderService) {}
  
  // host/{hashId}
  @Get(':hashId')
  async getOrderById(
    @Param('hashId') hashId: string,
  ) {
    const order = await this.orderService.getOrderByHashId(hashId);

    if (!order) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }

    return order;
  }

  // host/list/{customerId}?query=&page=&size=
  @Get('/list/:customerId')
  @ApiParam({ name: 'customerId'})
  @ApiQuery({ name: 'keyword', required: false})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
  async getOrderByProductNameStatusLabName(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getOrderList(
      params.customerId,
      keyword ? keyword.toLowerCase() : '',
      page,
      size,
    );
    
    return orders;
  }

  // host/bounty_list/{customerId}?query=&page=&size=
  @Get('/bounty_list/:customerId')
  @ApiParam({ name: 'customerId'})
  @ApiQuery({ name: 'keyword', required: false})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
  async getBountyByProductNameStatusLabName(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getBountyList(
      params.customerId,
      keyword ? keyword.toLowerCase() : '',
      page,
      size,
    );
    
    return orders;
  }
}
