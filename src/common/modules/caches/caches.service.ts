import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TransactionStatusList } from '../transaction-status/models/transaction-status.list';
import { TransactionTypeList } from '../transaction-type/models/transaction-type.list';
import { TransactionStatusInterface } from './interface/transaction-status.interface';
import { TransactionTypeInterface } from './interface/transaction-type.interface';

@Injectable()
export class CachesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getLastBlock(): Promise<number> {
    const lastBlock = await this.cacheManager.get<number>('last-block');

    if (!lastBlock) {
      return 10000317;
    }

    return lastBlock;
  }

  async setLastBlock(blockNumber: number): Promise<number> {
    return await this.cacheManager.set<number>('last-block', blockNumber);
  }

  async getTransactionStatus(status: TransactionStatusList, type: number) {
    return await this.cacheManager.get<TransactionStatusInterface>(
      `${status}-${type}`,
    );
  }

  async cacheTransactionStatus(status: string, id: number, idType: number) {
    return await this.cacheManager.set<TransactionStatusInterface>(status, {
      id: id,
      id_type: idType,
    });
  }

  async getTransactionType(status: TransactionTypeList) {
    return await this.cacheManager.get<TransactionTypeInterface>(status);
  }

  async cacheTransactionType(type: string, id: number) {
    return await this.cacheManager.set<TransactionTypeInterface>(type, {
      id: id,
    });
  }
}
