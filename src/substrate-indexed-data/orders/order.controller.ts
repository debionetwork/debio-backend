import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
    constructor(readonly orderService: OrderService) {}

    // host/{customer_id}/{product_name}/{status}/{lab_name}
    async getOrderByProductNameStatusLabName(
        @Param() params,
        @Query('page') page,
        @Query('size') size): Promise<any> {
        const orders = await this.orderService.getByProductNameStatusLabName(
            params.customer_id,
            params.product_name,
            params.status,
            params.lab_name,
            page,
            size,
        );

        return orders;
    }
}