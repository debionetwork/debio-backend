import { Injectable } from '@nestjs/common';
import {
  EthersContract,
  EthersSigner,
  SmartContract,
  WalletSigner,
} from 'nestjs-ethers';
import ABI from './utils/ABI.json';
import escrowContract from './utils/Escrow.json';
import { ethers } from 'ethers';
import { CachesService } from '../caches';
import { config } from '../../../config';

@Injectable()
export class EthereumService {
  constructor(
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

  getEthersProvider(): ethers.providers.JsonRpcProvider {
    const provider = new ethers.providers.JsonRpcProvider(
      config.WEB3_RPC_HTTPS.toString(),
    );
    return provider;
  }

  getContract(): SmartContract {
    try {
      const contract: SmartContract = this.ethersContract.create(
        config.ESCROW_CONTRACT_ADDRESS.toString(),
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
        config.ESCROW_CONTRACT_ADDRESS.toString(),
        escrowContract.abi,
        provider,
      );

      return contract;
    } catch (error) {
      console.log(error);
    }
  }
}
