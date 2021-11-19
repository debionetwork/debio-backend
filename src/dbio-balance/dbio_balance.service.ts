import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DbioBalanceDto } from './dto/dbio_balance.dto';
import { DbioBalance } from './models/dbio_balance.entity';

@Injectable()
export class DbioBalanceService {
  constructor(
    @InjectRepository(DbioBalance)
    private readonly dbioBalanceRepository: Repository<DbioBalance>,
  ) {}

  setDbioToDai(data: DbioBalanceDto) {
    const balance = this.getDebioBalance();

    if (balance) {
      return this.dbioBalanceRepository.save({ ...data, id: 1 });
    } else {
      return this.dbioBalanceRepository.save(data);
    }
  }

  getDebioBalance() {
    return this.dbioBalanceRepository.findOne({ where: { id: 1 } });
  }
}
