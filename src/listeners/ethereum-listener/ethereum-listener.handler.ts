import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EthereumService } from '../../common/modules/ethereum/ethereum.service';
import { EscrowService } from '../../common/modules/escrow/escrow.service';
import { TransactionLoggingService } from '../../common';

@Injectable()
export class EthereumListenerHandler implements OnModuleInit {
  private readonly logger: Logger = new Logger(EthereumListenerHandler.name);
  constructor(
    private readonly ethereumService: EthereumService,
    private readonly escrowService: EscrowService,
    private readonly transactioLoggingService: TransactionLoggingService,
  ) {}

  async onModuleInit() {
    await this.listenToEvents();
  }

  async listenToEvents() {
    const contract = this.ethereumService.getContract();
    const escrowContract = this.ethereumService.getEscrowSmartContract();
    const currentBlock = await contract.provider.getBlockNumber();
    const lastBlock = await this.ethereumService.getLastBlock();
    this.syncBlock(lastBlock, currentBlock, contract);

    contract.provider.on('block', async (blockNum) => {
      await this.ethereumService.setLastBlock(blockNum);
    });

    escrowContract.on('OrderPaid', async (order, event) => {
      await this.logger.log(
        `Order Paid Contract Event With Order Id: ${order.orderId}`,
      );
      await this.logger.log(`transaction Hash: ${event.transactionHash}`);
      await this.escrowService.setOrderPaidWithSubstrate(order.orderId);
    });

    escrowContract.on('OrderFulfilled', async (order, event) => {
      await this.logger.log(
        `Order Fulfilled Contract Event With Order Id: ${order.orderId}`,
      );
      await this.logger.log(`transaction Hash: ${event.transactionHash}`);
      //Update transaction_hash to DB
      const loggingFulfilled =
        await this.transactioLoggingService.getLoggingByHashAndStatus(
          order.orderId,
          3,
        );

      if (loggingFulfilled) {
        await this.transactioLoggingService.updateHash(
          loggingFulfilled,
          event.transactionHash,
        );
      }
    });

    escrowContract.on('OrderRefunded', async (order, event) => {
      await this.logger.log(
        `Order Refunded Contract Event With Order Id: ${order.orderId}`,
      );
      await this.logger.log(`transaction Hash: ${event.transactionHash}`);
      //Update transaction_hash to DB

      const loggingRefunded =
        await this.transactioLoggingService.getLoggingByHashAndStatus(
          order.orderId,
          4,
        );

      if (loggingRefunded) {
        await this.transactioLoggingService.updateHash(
          loggingRefunded,
          event.transactionHash,
        );
      }
    });
  }

  async syncBlock(lastBlock, currentBlock, contract) {
    const MIN_STARTING_BLOCK = 5484745;
    // Block paling jauh adalah MIN_STARTING_BLOCK
    const startBlock =
      lastBlock > MIN_STARTING_BLOCK ? lastBlock : MIN_STARTING_BLOCK;
    const endBlock = currentBlock;

    /**
     * Process logs in chunks of blocks
     * */
    const chunkSize = 200;
    let iStart = startBlock;
    let iEnd = endBlock;
    if (iEnd - iStart > chunkSize) {
      iEnd = iStart + chunkSize;
    }

    while (iStart < endBlock) {
      contract.filters.Transfer(
        null,
        '0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495',
      );

      // Remember the last block number processed
      await this.ethereumService.setLastBlock(iEnd);

      iStart = iEnd + 1;
      iEnd = iEnd + chunkSize > endBlock ? endBlock : iEnd + chunkSize;
    }
  }
}
