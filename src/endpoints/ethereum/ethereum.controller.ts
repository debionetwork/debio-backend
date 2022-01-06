import { Controller, UseInterceptors } from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { EscrowService } from '../escrow/escrow.service';
import { SentryInterceptor } from '../../common';

@UseInterceptors(SentryInterceptor)
@Controller('ethereum')
export class EthereumController {
  constructor(
    private readonly ethereumService: EthereumService,
    private readonly escrowService: EscrowService,
  ) {}

  async onModuleInit() {
    console.log('Init Ethereum Controller');
  }

  async onApplicationBootstrap() {
    const contract = await this.ethereumService.getContract();
    const escrowContract = await this.ethereumService.getEscrowSmartContract();
    const currentBlock = await contract.provider.getBlockNumber();
    const lastBlock = await this.ethereumService.getLastBlock();
    this.syncBlock(lastBlock, currentBlock, contract);

    contract.provider.on('block', async (blockNum) => {
      this.ethereumService.setLastBlock(blockNum);
    });

    escrowContract.on('OrderPaid', async (order) => {
      await this.escrowService.setOrderPaidWithSubstrate(order.orderId);
    });
  }

  async syncBlock(lastBlock, currentBlock, contract) {
    console.log('Syncing block from ' + lastBlock + ' to ' + currentBlock);
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
      console.log(`Syncing ${iStart} - ${iEnd}`);

      const filter = contract.filters.Transfer(
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
