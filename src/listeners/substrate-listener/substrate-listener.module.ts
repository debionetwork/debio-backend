import { Module } from "@nestjs/common";
import { DebioConversionModule, MailModule, RewardModule, SubstrateModule } from "../../common";
import { GeneticTestingCommandHandlers } from "./commands/genetic-testing";
import { ServiceRequestCommandHandlers } from "./commands/service-request";
import { ServiceCommandHandlers } from "./commands/services";
import { SubstrateListenerHandler } from "./substrate-listener.handler";

@Module({
  imports: [
    SubstrateModule,
    DebioConversionModule,
    RewardModule,
    MailModule,
  ],
  providers: [
    SubstrateListenerHandler,
    ...ServiceCommandHandlers,
    ...GeneticTestingCommandHandlers,
    ...ServiceRequestCommandHandlers
  ],
})
export class SubstrateListenerModule {}
