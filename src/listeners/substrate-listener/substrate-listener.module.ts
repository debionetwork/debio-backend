import { Module } from "@nestjs/common";
import { EscrowModule } from "../../endpoints/escrow/escrow.module";
import { DebioConversionModule, MailModule, RewardModule, SubstrateModule, TransactionLoggingModule } from "../../common";
import { GeneticTestingCommandHandlers } from "./commands/genetic-testing";
import { ServiceCommandHandlers } from "./commands/services";
import { SubstrateListenerHandler } from "./substrate-listener.handler";
import { OrderCommandHandlers } from "./commands/orders";

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
    ...OrderCommandHandlers,
  ],
})
export class SubstrateListenerModule {}
