import { Module } from "@nestjs/common";
import { EscrowModule } from "src/endpoints/escrow/escrow.module";
import { DebioConversionModule, MailModule, RewardModule, SubstrateModule, TransactionLoggingModule } from "../../common";
import { GeneticTestingCommandHandlers } from "./commands/genetic-testing";
import { ServiceCommandHandlers } from "./commands/services";
import { SubstrateListenerHandler } from "./substrate-listener.handler";

@Module({
  imports: [
    EscrowModule,
    TransactionLoggingModule,
    SubstrateModule,
    DebioConversionModule,
    RewardModule,
    MailModule,
  ],
  providers: [
    SubstrateListenerHandler,
    ...ServiceCommandHandlers,
    ...GeneticTestingCommandHandlers,
  ],
})
export class SubstrateListenerModule {}
