import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRequest } from './models/transaction-request.entity';
import { LoggingService } from './logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionRequest])],
  exports: [TypeOrmModule, LoggingService],
  controllers: [],
  providers: [LoggingService],
})
export class LoggingModule {}
