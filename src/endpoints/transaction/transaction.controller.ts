import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { TransactionHashDto } from './dto/transaction-hash.dto';
import { TransactionService } from './transaction.service';
import { Response } from 'express';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService
  ) {}

  @Post('/hash')
  @ApiBody({ type: TransactionHashDto })
  async submitTransactionHash(
    @Body() data: TransactionHashDto, 
    @Res() response: Response
  ) {
    try {
      await this.transactionService.submitTransactionHash(data.order_id, data.transaction_hash);
      response.status(200).send('done');
    } catch (error) {
      response.status(500).send(error);
    }
  }

  @Get('/hash')
  @ApiQuery({ name: 'order_id', required: true })
  async getTransactionHash(
    @Query('order_id') order_id: string,
    @Res() response: Response
  ) {
    try {
      const transaction_hash = await this.transactionService.getTransactionHashFromES(order_id);
      
      const result = {
        order_id: order_id,
        transaction_hash: transaction_hash
      }

      response.status(200).json(result);
    } catch (error) {
      response.status(500).send(error);
    }
  }
}
