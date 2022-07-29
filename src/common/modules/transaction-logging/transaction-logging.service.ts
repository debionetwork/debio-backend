import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatusList } from '../transaction-status/models/transaction-status.list';
import { TransactionStatusService } from '../transaction-status/transaction-status.service';
import { TransactionTypeList } from '../transaction-type/models/transaction-type.list';
import { TransactionTypeService } from '../transaction-type/transaction-type.service';
import { TransactionLoggingDto } from './dto/transaction-logging.dto';
import { TransactionRequest } from './models/transaction-request.entity';

@Injectable()
export class TransactionLoggingService {
  constructor(
    @InjectRepository(TransactionRequest)
    private readonly transactionRequestRepository: Repository<TransactionRequest>,
    private readonly transactionStatusService: TransactionStatusService,
    private readonly transactionTypeService: TransactionTypeService,
  ) {}

  private async getTransactionStatus(
    status: TransactionStatusList,
    type: number,
  ) {
    const transactionStatusDb =
      await this.transactionStatusService.getTransactionStatus(type, status);

    return transactionStatusDb.id;
  }

  private async getTransactionType(type: TransactionTypeList) {
    const transactionTypeDb =
      await this.transactionTypeService.getTransactionType(type);

    return transactionTypeDb.id;
  }

  async create(data: TransactionLoggingDto) {
    const transactionType = await this.getTransactionType(
      data.transaction_type,
    );
    const transactionStatus = await this.getTransactionStatus(
      data.transaction_status,
      transactionType,
    );

    const logging = new TransactionRequest();
    logging.address = data.address;
    logging.amount = +data.amount;
    logging.created_at = data.created_at;
    logging.currency = data.currency;
    logging.parent_id = data.parent_id.toString();
    logging.ref_number = data.ref_number;
    logging.transaction_type = transactionType;
    logging.transaction_status = transactionStatus;

    return this.transactionRequestRepository.save(logging);
  }

  updateHash(transaction: TransactionRequest, transaction_hash: string) {
    transaction.transaction_hash = transaction_hash;
    return this.transactionRequestRepository.update(
      transaction.id.toString(),
      transaction,
    );
  }

  getLoggingByOrderId(ref_number: string) {
    return this.transactionRequestRepository.findOne({
      where: {
        ref_number,
        parent_id: BigInt(0).toString(),
      },
    });
  }

  getLoggingByHashAndStatus(ref_number: string, transaction_status: number) {
    return this.transactionRequestRepository.findOne({
      where: {
        ref_number,
        transaction_status,
      },
    });
  }

  getRewardBindingByAccountId(accountId) {
    return this.transactionRequestRepository.findOne({
      where: {
        transaction_status: 33,
        address: accountId,
      },
    });
  }
}
