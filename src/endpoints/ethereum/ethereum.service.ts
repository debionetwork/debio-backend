import { Injectable } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  SmartContract,
  WalletSigner,
} from 'nestjs-ethers';
import ABI from './utils/ABI.json';
import axios from 'axios';
import escrowContract from './utils/Escrow.json';
import { ethers } from 'ethers';
import { CachesService } from '../../common/modules/caches';
import { ProcessEnvProxy } from '../../common';

@Injectable()
export class EthereumService {
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly ethersContract: EthersContract,
    private readonly ethersSigner: EthersSigner,
    private readonly cachesService: CachesService,
  ) {}

  async getLastBlock(): Promise<number> {
    return await this.cachesService.getLastBlock();
  }

  async setLastBlock(blockNumber) {
    await this.cachesService.setLastBlock(blockNumber);
  }

  async getContract(): Promise<any> {
    try {
      const contract: SmartContract = this.ethersContract.create(
        this.process.env.ESCROW_CONTRACT_ADDRESS,
        ABI,
      );

      console.log('block number: ', await contract.provider.getBlockNumber());
      return contract;
    } catch (error) {
      console.log(error);
    }
  }

  async getEscrowSmartContract(): Promise<any> {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        this.process.env.WEB3_RPC_HTTPS,
      );
      const contract = new ethers.Contract(
        this.process.env.ESCROW_CONTRACT_ADDRESS,
        escrowContract.abi,
        provider,
      );
      return contract;
    } catch (error) {
      console.log(error);
    }
  }

  async createWallet(privateKey: string): Promise<WalletSigner> {
    const wallet: WalletSigner = await this.ethersSigner.createWallet(
      privateKey,
    );
    return wallet;
  }

  async getGasEstimationFee(from, to, data = null) {
    const res = await axios.post(process.env.ETHEREUM_RPC, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateGas',
      params: [{ from, to, data }],
    });
    const gasEstimation = res.data.result;
    return ethers.BigNumber.from(String(gasEstimation)).toString();
  }

  /**
   * convertCurrency
   * If converting from eth make sure that the unit is in ETH (not in wei, gwei, etc)
   * @param fromCurrency Convert from this currency
   * @param toCurrency To this currency
   * @param amount Amount
   * @returns quote: object
   */
  async convertCurrency(
    fromCurrency = 'ETH',
    toCurrency = 'DAI',
    amount: number | string,
  ) {
    const res = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/tools/price-conversion',
      {
        params: {
          amount,
          symbol: fromCurrency,
          convert: toCurrency,
        },
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
        },
      },
    );

    return res.data.data.quote[toCurrency];
  }
}
