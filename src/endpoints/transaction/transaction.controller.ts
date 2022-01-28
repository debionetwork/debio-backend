import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { TransactionHashDto } from './dto/transaction-hash.dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/hash')
  @ApiBody({ type: TransactionHashDto })
  async submitTransactionHash(@Body() data: TransactionHashDto) {
    await this.transactionService.submitTransactionHash(
      data.order_id,
      data.transaction_hash,
    );
    return { status: 'ok' };
  }

  @Get('/hash')
  @ApiQuery({ name: 'order_id', required: true })
  async getTransactionHash(@Query('order_id') order_id: string) {
    const transaction_hash =
      await this.transactionService.getTransactionHashFromES(order_id);

    return {
      order_id: order_id,
      transaction_hash: transaction_hash,
    };
  }
}
