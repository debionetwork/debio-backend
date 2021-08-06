import { Controller } from '@nestjs/common';
import { EthereumService } from './ethereum.service';
import { EscrowService } from '../escrow/escrow.service';
import { utils, ethers } from 'ethers';
import ABI from './utils/ABI.json';


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
    // const val15 = ethers.utils.formatBytes32String('15')
    // console.log('decimal 1 to b32 ======> ', val15);
    // console.log('b 32 ',val15,' to decimmal ======> ', ethers.utils.toUtf8String(val15));
    const iface = new ethers.utils.Interface(ABI)

    const val = await this.getGasEstimationFee()
    // console.log('result ', val ,' ======> ', ethers.utils.toUtf8String(val));
    // console.log('======> ',val,'', ethers.BigNumber.from("0x3135").toString());
    console.log('iface-->', iface.encodeFunctionData("transferFrom",[
      "0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495",
      "0xd50d4dE65379BAcDFeC59865a0894bc69E020e1D",
      ethers.utils.parseUnits(String(15), 18)]));

    console.log('======> ',val);
    
    
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

  async getGasEstimationFee(){
    
    try {
      const requestOptions = {
        method: 'POST',
        uri: 'http://testnet.theapps.dev/rpc',
        body: {"jsonrpc":"2.0","id":1,"method":"eth_estimateGas","params":[{"data":"0x608060405234801561001057600080fd5b506040516102a13803806102a183398181016040528101906100329190610054565b806000819055505061009e565b60008151905061004e81610087565b92915050565b60006020828403121561006657600080fd5b60006100748482850161003f565b91505092915050565b6000819050919050565b6100908161007d565b811461009b57600080fd5b50565b6101f4806100ad6000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80637cf5dab0146100465780638381f58a14610062578063d826f88f14610080575b600080fd5b610060600480360381019061005b91906100c5565b61008a565b005b61006a6100a1565b60405161007791906100fd565b60405180910390f35b6100886100a7565b005b806000546100989190610118565b60008190555050565b60005481565b60008081905550565b6000813590506100bf816101a7565b92915050565b6000602082840312156100d757600080fd5b60006100e5848285016100b0565b91505092915050565b6100f78161016e565b82525050565b600060208201905061011260008301846100ee565b92915050565b60006101238261016e565b915061012e8361016e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561016357610162610178565b5b828201905092915050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6101b08161016e565b81146101bb57600080fd5b5056fea2646970667358221220bd81c94057c94a59a3d7a613caf9b6bb9d93827e1c61cfaf444e295e35c2fd8964736f6c634300080000330000000000000000000000000000000000000000000000000000000000000005"}]}
        ,
        json: true,
      };
      const result =  await rp(requestOptions)
      return result

    } catch (error) {
      console.log(error);
      
    }
    // console.log("disini------,", await contract.estimateGas.transferFrom(
    //   '0x42D57aAA086Ee6575Ddd3b502af1b07aEa91E495',
    //    '0xd50d4dE65379BAcDFeC59865a0894bc69E020e1D',
    //     1,
    //     {
    //   gasLimit: 60000,
    //   gasPrice: ethers.utils.parseUnits('100', 'gwei'),
    // }))
    // const gasPrice = await contract.provider.getGasPrice()

    // return utils.formatUnits(gasPrice, "kwei")
  }

  async convertionCurrency(value, to='USD', from='ETH') {
    try {
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
      const result =  await rp(requestOptions)
      return result.data

    } catch (error) {
      console.log(error);      
    }
  
  }
  
}
