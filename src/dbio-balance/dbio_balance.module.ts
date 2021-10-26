import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DbioBalanceController } from "./dbio_balance.controller";
import { DbioBalanceService } from "./dbio_balance.service";
import { DbioBalance } from "./models/dbio_balance.entity";

@Module({
  imports: [TypeOrmModule.forFeature([DbioBalance])],
  controllers: [DbioBalanceController],
  providers: [DbioBalanceService],
  exports: [DbioBalanceService]
})
export class DbioBalanceModule {}