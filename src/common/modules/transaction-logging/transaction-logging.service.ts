import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLoggingDto } from './dto/transaction-logging.dto';
import { TransactionRequest } from './models/transaction-request.entity';

@Injectable()
export class TransactionLoggingService {
  constructor(
    @InjectRepository(TransactionRequest)
    private readonly transactionRequestRepository: Repository<TransactionRequest>,
  ) {}

  create(data: TransactionLoggingDto) {
    const logging = new TransactionRequest();
    logging.address = data.address;
    logging.amount = +data.amount;
    logging.created_at = data.created_at;
    logging.currency = data.currency;
    logging.parent_id = data.parent_id;
    logging.ref_number = data.ref_number;
    logging.transaction_type = data.transaction_type;
    logging.transaction_status = data.transaction_status;
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
    return this.transactionRequestRepository.findOneBy({
      ref_number,
      parent_id: BigInt(0),
    });
  }

  getLoggingByHashAndStatus(ref_number: string, transaction_status: number) {
    return this.transactionRequestRepository.findOneBy({
      ref_number,
      transaction_status,
    });
  }
}
