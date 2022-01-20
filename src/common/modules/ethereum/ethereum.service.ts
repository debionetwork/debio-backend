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
import { CachesService } from '../caches';
import { ProcessEnvProxy } from '../proxies';

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

  getEthersProvider(): ethers.providers.JsonRpcProvider {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.WEB3_RPC_HTTPS,
      );
      return provider;
    } catch (error) {
      console.log(error);
    }
  }

  getContract(): SmartContract {
    try {
      const contract: SmartContract = this.ethersContract.create(
        this.process.env.ESCROW_CONTRACT_ADDRESS,
        ABI,
      );

      return contract;
    } catch (error) {
      console.log(error);
    }
  }

  getEscrowSmartContract(): ethers.Contract {
    try {
      const provider = this.getEthersProvider();
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
