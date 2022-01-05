import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiParam, ApiQuery } from '@nestjs/swagger';
import { SentryInterceptor } from 'src/common';
import { OrderService } from './order.service';

@UseInterceptors(SentryInterceptor)
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

  // host/list/{customer_id}?query=&page=&size=
  @Get('/list/:customer_id')
  @ApiParam({ name: 'customer_id'})
  @ApiQuery({ name: 'keyword', required: false})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
  async getOrderByCustomer(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getOrderList(
      'customer',
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );
    
    return orders;
  }

  // host/bounty_list/{customer_id}?query=&page=&size=
  @Get('/bounty_list/:customer_id')
  @ApiParam({ name: 'customer_id'})
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
      params.customer_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );
    
    return orders;
  }

  // host/list/lab/{:lab_id}?query=&page=&size=
  @Get('/list/lab/:lab_id')
  @ApiParam({ name: 'lab_id'})
  @ApiQuery({ name: 'keyword', required: false})
  @ApiQuery({ name: 'page', required: false})
  @ApiQuery({ name: 'size', required: false})
  async getOrderByLab(
    @Param() params,
    @Query('keyword') keyword: string,
    @Query('page') page,
    @Query('size') size,
  ) {
    const orders = await this.orderService.getOrderList(
      'lab',
      params.lab_id,
      keyword ? keyword.toLowerCase() : '',
      Number(page),
      Number(size),
    );
    
    return orders;
  }
}
