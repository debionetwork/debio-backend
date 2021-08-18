import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRequest } from './models/transaction-request.entity';

interface DataInput {
  address: string;
  amount: bigint;
  create_at: Date;
  currency: string;
  parent_id: bigint;
  ref_number: string;
  ref_type: number;
  type: number;
}

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(TransactionRequest)
    private readonly transactionRequestRepository: Repository<TransactionRequest>,
  ) {}

  create(data: DataInput) {
    const logging = new TransactionRequest();
    logging.address = data.address;
    logging.amount = data.amount;
    logging.create_at = data.create_at;
    logging.currency = data.currency;
    logging.parent_id = data.parent_id;
    logging.ref_number = data.ref_number;
    logging.ref_type = data.ref_type;
    logging.type = data.type;
    return this.transactionRequestRepository.save(logging);
  }
}
