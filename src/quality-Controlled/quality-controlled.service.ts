import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQualityControlledDto } from './dto/create-quality-controlled.dto';
import { QualityControlled } from './models/quality-controlled.entity';

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
export class QualityControlledService {
  constructor(
    @InjectRepository(QualityControlled)
    private readonly QualityControlledRepository: Repository<QualityControlled>,
  ) {}

  create(data: DataInput) {
    const logging = new QualityControlled();
    logging.address = data.address;
    logging.amount = data.amount;
    logging.create_at = data.create_at;
    logging.currency = data.currency;
    logging.parent_id = data.parent_id;
    logging.ref_number = data.ref_number;
    logging.ref_type = data.ref_type;
    logging.type = data.type;
    return this.QualityControlledRepository.save(logging);
  }
}
