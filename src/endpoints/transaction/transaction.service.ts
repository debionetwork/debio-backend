import { HttpException, Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TransactionLoggingService } from '../../common/modules/transaction-logging';

@Injectable()
export class TransactionService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly transactionLoggingService: TransactionLoggingService
  ) {}

  async submitTransactionHash(order_id: string, transaction_hash: string) {
    const transaction_logging = await this.transactionLoggingService.getLoggingByOrderId(order_id);
    if (transaction_logging) {
      await this.transactionLoggingService.updateHash(transaction_logging, transaction_hash);
  
      await this.elasticsearchService.update({
        index: 'orders',
        id: order_id,
        body: {
          doc: {
            transaction_hash: transaction_hash
          }
        }
      });
    } else {
      throw new HttpException('Cannot find transaction', 400);
    }
  }

  async getTransactionHashFromES(order_id: string) {
    const orders = await this.elasticsearchService.search({
      index: 'orders',
      body: {
        query: {
          match: { _id: order_id }
        }
      }
    });

    if (orders.body.hits.hits.length <= 0) {
      throw new HttpException('Cannot find transaction hash', 400);
    }
    
    const { _source } = orders.body.hits.hits[0];
    return _source['transaction_hash'];
  }

  async getTransactionHashFromPG(order_id: string) {
    const transaction = await this.transactionLoggingService.getLoggingByOrderId(order_id);
    
    if (!transaction) {
      throw new HttpException('Cannot find transaction hash', 400);
    }

    return transaction.transaction_hash;
  }
}
