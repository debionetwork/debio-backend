import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { TransactionLoggingService } from 'src/common/modules/transaction-logging';

@Injectable()
export class TransactionService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly transactionLoggingService: TransactionLoggingService
  ) {}

  async submitTransactionHash(order_id: string, transaction_hash: string) {
    await this.transactionLoggingService.updateHash(order_id, transaction_hash);

    await this.elasticsearchService.update({
      index: 'orders',
      id: order_id,
      body: {
        doc: {
          transaction_hash: transaction_hash
        }
      }
    });
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

    const { _source } = orders.body.hits.hits[0];
    return _source['transaction_hash'];
  }

  async getTransactionHashFromPG(order_id: string) {
    const transaction = await this.transactionLoggingService.getLoggingByOrderId(order_id);
    
    return transaction.transaction_hash;
  }
}
