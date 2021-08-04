import { Controller } from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { EscrowService } from '../escrow/escrow.service';
import { utils, ethers } from 'ethers';
import rp from 'request-promise'

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
    const currentBlock = await contract.provider.getBlockNumber();
    const lastBlock = await this.ethereumService.getLastBlock();
    this.syncBlock(lastBlock, currentBlock, contract);
    console.log('Ready to listen Transfer event ...');
  
    contract.provider.on('block', async (blockNum) => {
      this.ethereumService.setLastBlock(blockNum);
    });

    contract.on('Transfer', async (from, to, amount, event) => {
      if (to == process.env.DEBIO_ETH_ADDRESS) {
        await this.escrowService.handlePaymentToEscrow(from, amount);
      }
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

  async getGasEstimationFee(contract){
    // console.log("disini------,", await contract.estimateGas.transferFrom(
    //   '0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495',
    //    '0xd50d4dE65379BAcDFeC59865a0894bc69E020e1D',
    //     1,
    //     {
    //   gasLimit: 60000,
    //   gasPrice: ethers.utils.parseUnits('100', 'gwei'),
    // }))
    const gasPrice = await contract.provider.getGasPrice()

    return utils.formatUnits(gasPrice, "kwei")
  }

  async convertionCurrency(value, to='USD', from='ETH') {
    const currencyValue = parseFloat(value)

    const requestOptions = {
      method: 'GET',
      uri: 'https://pro-api.coinmarketcap.com/v1/tools/price-conversion',
      qs: {
        'amount': value,
        'symbol': from,
        'convert': to,
      },
      headers: {
        'X-CMC_PRO_API_KEY': 'fa1134a3-84b3-4ae0-91e4-a3f3b52b05e5'
      },
      json: true,
      gzip: true
    };
    
    rp(requestOptions).then(response => {
      console.log('API call response:',JSON.stringify(response,null,2));
    }).catch((err) => {
      console.log('API call error:', err.message);
    });
  }
  
}
