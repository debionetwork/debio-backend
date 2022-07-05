import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ProcessEnvProxy, SubstrateService } from '../../common';
import { Header, Event } from '@polkadot/types/interfaces';
import {
  SetLastSubstrateBlockCommand,
  GetLastSubstrateBlockQuery,
} from './blocks';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BlockMetaData } from './models/block-metadata.event-model';
import { ServiceCreatedCommand } from './commands/services/service-created/service-created.command';
import {
  ServiceRequestClaimedCommand,
  ServiceRequestCreatedCommand,
  ServiceRequestProcessedCommand,
  ServiceRequestStakingAmountRefundedCommand,
  ServiceRequestUnstakedCommand,
  ServiceRequestWaitingForUnstakedCommand,
  ServiceRequestStakingAmountIncreasedCommand,
  ServiceRequestStakingAmountExcessRefundedCommand,
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
  GeneticAnalysisOrderFulfilledCommand,
  GeneticAnalysisOrderCancelledCommand,
} from './commands/genetic-analysis-order';
import {
  GeneticAnalysisRejectedCommand,
  GeneticAnalysisResultReadyCommand,
} from './commands/genetic-analysis';
import {
  GeneticAnalystStakedCommand,
  GeneticAnalystUnstakedCommand,
  GeneticAnalystVerificationStatusCommand,
} from './commands/genetic-analysts';
import {
  LabRegisteredCommand,
  LabRetrieveUnstakeAmountCommand,
  LabStakeSuccessfulCommand,
  LabUnstakedCommand,
  LabUpdateVerificationStatusCommand,
} from './commands/labs';
import { GeneticAnalystServiceCreatedCommand } from './commands/genetic-analyst-services';
import {
  DataStakedCommand,
  DnaSampleRejectedCommand,
  DnaSampleResultReadyCommand,
} from './commands/genetic-testing';

const eventRoutes = {
  services: {
    ServiceCreated: ServiceCreatedCommand,
  },
  serviceRequest: {
    ServiceRequestClaimed: ServiceRequestClaimedCommand,
    ServiceRequestCreated: ServiceRequestCreatedCommand,
    ServiceRequestProcessed: ServiceRequestProcessedCommand,
    ServiceRequestUnstaked: ServiceRequestUnstakedCommand,
    ServiceRequestWaitingForUnstaked: ServiceRequestWaitingForUnstakedCommand,
    StakingAmountIncreased: ServiceRequestStakingAmountIncreasedCommand,
    StakingAmountExcessRefunded:
      ServiceRequestStakingAmountExcessRefundedCommand,
    StakingAmountRefunded: ServiceRequestStakingAmountRefundedCommand,
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
    DnaSampleResultReady: DnaSampleResultReadyCommand,
    DnaSampleRejected: DnaSampleRejectedCommand,
  },
  geneticAnalysisOrders: {
    GeneticAnalysisOrderPaid: GeneticAnalysisOrderPaidCommand,
    GeneticAnalysisOrderCreated: GeneticAnalysisOrderCreatedCommand,
    GeneticAnalysisOrderRefunded: GeneticAnalysisOrderRefundedCommand,
    GeneticAnalysisOrderFulfilled: GeneticAnalysisOrderFulfilledCommand,
    GeneticAnalysisOrderCancelled: GeneticAnalysisOrderCancelledCommand,
  },
  geneticAnalysis: {
    GeneticAnalysisRejected: GeneticAnalysisRejectedCommand,
    GeneticAnalysisResultReady: GeneticAnalysisResultReadyCommand,
  },
  geneticAnalysts: {
    GeneticAnalystStakeSuccessful: GeneticAnalystStakedCommand,
    GeneticAnalystUnstakeSuccessful: GeneticAnalystUnstakedCommand,
    GeneticAnalystUpdateVerificationStatus:
      GeneticAnalystVerificationStatusCommand,
  },
  geneticAnalystServices: {
    GeneticAnalystServiceCreated: GeneticAnalystServiceCreatedCommand,
  },
  labs: {
    LabRegistered: LabRegisteredCommand,
    LabStakeSuccessful: LabStakeSuccessfulCommand,
    LabUnstakeSuccessful: LabUnstakedCommand,
    LabRetrieveUnstakeAmount: LabRetrieveUnstakeAmountCommand,
    LabUpdateVerificationStatus: LabUpdateVerificationStatusCommand,
  },
};

@Injectable()
export class SubstrateListenerHandler implements OnModuleInit {
  private event: any;
  private readonly logger: Logger = new Logger(SubstrateListenerHandler.name);
  private lastBlock = 0;
  private head;

  constructor(
    private readonly substrate: SubstrateService,
    private readonly commandBus: CommandBus,
    private queryBus: QueryBus,
    private process: ProcessEnvProxy,
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

  async eventFromBlock(blockNumber: number, blockHash: string | Uint8Array) {
    const apiAt = await this.substrate.api.at(blockHash);

    const allEventsFromBlock: any = await apiAt.query.system.events();

    const events = allEventsFromBlock.filter(
      ({ phase }) => phase.isApplyExtrinsic,
    );

    const blockMetaData: BlockMetaData = {
      blockNumber: blockNumber,
      blockHash: blockHash.toString(),
    };

    for (let i = 0; i < events.length; i++) {
      const { event } = events[i];
      await this.handleEvent(blockMetaData, event);
    }
  }

  async listenToEvents() {
    await this.substrate.api.query.system
      .events(async (events) => {
        try {
          const currentBlock: any =
            await this.substrate.api.rpc.chain.getBlock();
          const currentBlockNumber =
            currentBlock.block.header.number.toNumber();
          const blockHash: any =
            await this.substrate.api.rpc.chain.getBlockHash(currentBlockNumber);

          const blockMetaData: BlockMetaData = {
            blockNumber: currentBlockNumber,
            blockHash: blockHash.toString(),
          };
          this.logger.log(`Handle Event Block: ${blockMetaData.blockNumber}`);

          for (let i = 0; i < events.length; i++) {
            const { event } = events[i];
            await this.handleEvent(blockMetaData, event);
          }
          // await this.substrate.api.isReady;

          // sync block
          // TODO await this.syncBlock(currentBlock);

          // await this.listenToNewBlock();
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

  async listenToNewBlock() {
    await this.substrate.api.rpc.chain
      .subscribeNewHeads(async (header: Header) => {
        try {
          const blockNumber = header.number.toNumber();
          const blockHash = await this.substrate.api.rpc.chain.getBlockHash(
            blockNumber,
          );

          // check if env is development
          if (this.process.env.NODE_ENV === 'development') {
            this.lastBlock = await this.queryBus.execute(
              new GetLastSubstrateBlockQuery(),
            );
          }

          if (this.lastBlock == blockNumber) {
            return;
          } else {
            this.lastBlock = blockNumber;
          }

          this.logger.log(`Syncing Substrate Block: ${blockNumber}`);

          await this.eventFromBlock(blockNumber, blockHash);

          await this.commandBus.execute(
            new SetLastSubstrateBlockCommand(blockNumber),
          );
        } catch (err) {
          this.logger.log(
            `Handling listen to new block catch : ${err.name}, ${err.message}, ${err.stack}`,
          );
        }
      })
      .then((_unsub) => {
        this.head = _unsub;
      })
      .catch((err) => {
        this.logger.log(
          `Event listener catch error ${err.name}, ${err.message}, ${err.stack}`,
        );
      });
  }

  async syncBlock(currentBlock: any) {
    let lastBlock = 1;
    try {
      //TODO get last block: need storage to save lastblock
      lastBlock = await this.queryBus.execute(new GetLastSubstrateBlockQuery());
      const currentBlockNumber = currentBlock.block.header.number.toNumber();
      /**
       * Process logs in chunks of blocks
       * */
      const endBlock = currentBlockNumber;
      const chunkSize = 1000;
      let chunkStart = lastBlock;
      let chunkEnd = currentBlockNumber;
      // If chunkEnd is more than chunkSize, set chunkEnd to chunkSize
      if (chunkEnd - chunkStart > chunkSize) {
        chunkEnd = chunkStart + chunkSize;
      }
      while (chunkStart < endBlock) {
        this.logger.log(`Syncing block ${chunkStart} - ${chunkEnd}`);
        for (let i = chunkStart; i <= chunkEnd; i++) {
          // Get block by block number
          const blockHash: any =
            await this.substrate.api.rpc.chain.getBlockHash(i);
          const signedBlock: any = await this.substrate.api.rpc.chain.getBlock(
            blockHash,
          );

          const apiAt = await this.substrate.api.at(
            signedBlock.block.header.hash,
          );
          // Get the event records in the block
          const allEventRecords: any = await apiAt.query.system.events();

          const blockMetaData: BlockMetaData = {
            blockNumber: i,
            blockHash: blockHash.toString(),
          };

          for (let j = 0; j < signedBlock.block.extrinsics.length; j++) {
            const {
              method: { method, section }, // eslint-disable-line
            } = signedBlock.block.extrinsics[j];

            const events = allEventRecords.filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(j),
            );

            for (const { event } of events) {
              await this.handleEvent(blockMetaData, event);
            }
          }
        }
        // Remember the last block number processed
        await this.commandBus.execute(
          new SetLastSubstrateBlockCommand(chunkEnd),
        );

        // set chunkStart to 1 block after chunkEnd
        chunkStart = chunkEnd + 1;
        // if chunkEnd + chunkSize is more than endBlock,
        // set chunkEnd to endBlock
        // else set chunkEnd to (chunkEnd + chunkSize)
        chunkEnd =
          chunkEnd + chunkSize > endBlock ? endBlock : chunkEnd + chunkSize;
      }
    } catch (err) {
      this.logger.log(
        `Handling sync block catch : ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }
}
