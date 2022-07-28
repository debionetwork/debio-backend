import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionStatus } from './models/transaction-status.entity';
import { TransactionStatusService } from './transaction-status.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionStatus])],
  exports: [TypeOrmModule, TransactionStatusService],
  controllers: [],
  providers: [TransactionStatusService],
})
export class TransactionStatusModule {}
