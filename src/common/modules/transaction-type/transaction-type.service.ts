import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from './models/transaction-type.entity';
import { TransactionTypeList } from './models/transaction-type.list';

@Injectable()
export class TransactionTypeService {
  constructor(
    @InjectRepository(TransactionType)
    private readonly transactionTypeRepository: Repository<TransactionType>,
  ) {}

  async getTransactionType(type: TransactionTypeList) {
    return await this.transactionTypeRepository.findOne({
      where: {
        type: type,
      },
    });
  }
}
