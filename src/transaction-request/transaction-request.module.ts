import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionRequest } from "./models/transaction-request.entity";
import { TransactionRequestService } from "./transaction-request.service";

@Module({
  imports: [TypeOrmModule.forFeature([TransactionRequest])],
  exports: [TypeOrmModule],
  controllers: [],
  providers: [TransactionRequestService]
})
export class TransactionRequestModule {}