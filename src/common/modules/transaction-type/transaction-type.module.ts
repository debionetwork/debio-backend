import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionType } from './models/transaction-type.entity';
import { TransactionTypeService } from './transaction-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionType])],
  exports: [TypeOrmModule, TransactionTypeService],
  controllers: [],
  providers: [TransactionTypeService],
})
export class TransactionTypeModule {}
