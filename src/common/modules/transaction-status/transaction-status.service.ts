import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatus } from './models/transaction-status.entity';
import { TransactionStatusList } from './models/transaction-status.list';

@Injectable()
export class TransactionStatusService {
  constructor(
    @InjectRepository(TransactionStatus)
    private readonly transactionStatusRepository: Repository<TransactionStatus>,
  ) {}

  async getTransactionStatus(
    idType: number,
    transactionStatus: TransactionStatusList,
  ) {
    return await this.transactionStatusRepository.findOne({
      where: {
        id_type: idType,
        transaction_status: transactionStatus,
      },
    });
  }
}
