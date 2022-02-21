import { Injectable, OnModuleInit } from '@nestjs/common';
import { EthereumService } from '../../common/modules/ethereum/ethereum.service';
import { EscrowService } from '../../common/modules/escrow/escrow.service';

@Injectable()
export class EthereumListenerHandler implements OnModuleInit {
  constructor(
    private readonly ethereumService: EthereumService,
    private readonly escrowService: EscrowService,
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

    escrowContract.on('OrderPaid', async (order) => {
      await this.escrowService.setOrderPaidWithSubstrate(order.orderId);
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
