import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { SubstrateService } from '../../common';
import { Event } from '@polkadot/types/interfaces';
import { CommandBus } from '@nestjs/cqrs';
import { BlockMetaData } from './models/block-metadata.event-model';
import { ServiceCreatedCommand } from './commands/services/service-created/service-created.command';
import { DataStakedCommand } from './commands/genetic-testing/data-staked/data-staked.command';
import {
  ServiceRequestCreatedCommand,
  ServiceRequestProcessedCommand,
  ServiceRequestUnstakedCommand,
  ServiceRequestWaitingForUnstakedCommand,
} from './commands/service-request';
import {
  OrderCancelledCommand,
  OrderCreatedCommand,
  OrderFailedCommand,
  OrderFulfilledCommand,
  OrderPaidCommand,
  OrderRefundedCommand,
} from './commands/orders';
import { 
  GeneticAnalysisOrderCreatedCommand,
  GeneticAnalysisOrderPaidCommand,
  GeneticAnalysisOrderRefundedCommand,
  GeneticAnalysisOrderFulfilledCommand
} from './commands/genetic-analysis-order';
import { GeneticAnalysisRejectedCommand, GeneticAnalysisResultReadyCommand } from './commands/genetic-analysis';

const eventRoutes = {
  services: {
    ServiceCreated: ServiceCreatedCommand,
  },
  serviceRequest: {
    ServiceRequestCreated: ServiceRequestCreatedCommand,
    ServiceRequestProcessed: ServiceRequestProcessedCommand,
    ServiceRequestUnstaked: ServiceRequestUnstakedCommand,
    ServiceRequestWaitingForUnstaked: ServiceRequestWaitingForUnstakedCommand,
  },
  orders: {
    OrderCreated: OrderCreatedCommand,
    OrderPaid: OrderPaidCommand,
    OrderFulfilled: OrderFulfilledCommand,
    OrderRefunded: OrderRefundedCommand,
    OrderCancelled: OrderCancelledCommand,
    OrderFailed: OrderFailedCommand,
  },
  geneticTesting: {
    DataStaked: DataStakedCommand,
  },
  geneticAnalysisOrders: {
    GeneticAnalysisOrderPaid: GeneticAnalysisOrderPaidCommand,
    GeneticAnalysisOrderCreated: GeneticAnalysisOrderCreatedCommand,
    GeneticAnalysisOrderRefunded: GeneticAnalysisOrderRefundedCommand,
    GeneticAnalysisOrderFulfilled: GeneticAnalysisOrderFulfilledCommand,
  },
  geneticAnalysis: {
    GeneticAnalysisRejected: GeneticAnalysisRejectedCommand,
    GeneticAnalysisResultReady: GeneticAnalysisResultReadyCommand,
  },
};

@Injectable()
export class SubstrateListenerHandler implements OnModuleInit {
  private event: any;
  private readonly logger: Logger = new Logger(SubstrateListenerHandler.name);
  private lastBlock: 0;

  constructor(
    private readonly substrate: SubstrateService,
    private readonly commandBus: CommandBus,
  ) {}

  async onModuleInit() {
    await this.listenToEvents();
  }

  async handleEvent(blockMetaData: BlockMetaData, event: Event) {
    try {
      // if currenblock equal to lastblock, skip handler
      if (this.lastBlock == blockMetaData.blockNumber) {
        return;
      }
      const eventSection = eventRoutes[event.section];

      if (eventSection && eventSection[event.method]) {
        this.logger.log(
          `Handling substrate event: ${event.section}.${event.method}`,
        );

        const eventMethod = new eventSection[event.method](
          event.data,
          blockMetaData,
        );

        await this.commandBus.execute(eventMethod);
      }
    } catch (err) {
      this.logger.log(
        `Handling substrate catch : ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }

  async listenToEvents() {
    await this.substrate.api.query.system
      .events(async (events) => {
        try {
          const currentBlock = await this.substrate.api.rpc.chain.getBlock();
          const currentBlockNumber =
            currentBlock.block.header.number.toNumber();
          const blockHash = await this.substrate.api.rpc.chain.getBlockHash(
            currentBlockNumber,
          );

          const blockMetaData: BlockMetaData = {
            blockNumber: currentBlockNumber,
            blockHash: blockHash.toString(),
          };

          for (let i = 0; i < events.length; i++) {
            const { event } = events[i];
            await this.handleEvent(blockMetaData, event);
          }
        } catch (err) {
          this.logger.log(
            `Handling listen to event catch : ${err.name}, ${err.message}, ${err.stack}`,
          );
        }
      })
      .then((_unsub) => {
        this.event = _unsub;
      })
      .catch((err) => {
        this.logger.log(
          `Event listener catch error ${err.name}, ${err.message}, ${err.stack}`,
        );
      });
  }
}
