import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTransactionRequestDto } from "./dto/create-transaction-request.dto";
import { TransactionRequest } from "./models/transaction-request.entity";

@Injectable()
export class TransactionRequestService {
  constructor(
    @InjectRepository(TransactionRequest)
    private readonly transactionRequest: Repository<TransactionRequest>
  ) {}

  create(data: CreateTransactionRequestDto) {
    const logging = new TransactionRequest();
    logging.address = data.address;
    logging.amount = data.amount;
    logging.create_at = data.create_at;
    logging.currency = data.currency;
    logging.parent_id = data.parent_id;
    logging.ref_number = data.ref_number;
    logging.ref_type = data.ref_type;
    logging.type = data.type
  }
}