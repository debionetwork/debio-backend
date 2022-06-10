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
import { GoogleSecretManagerService } from '../google-secret-manager';

@Injectable()
export class EthereumService {
  constructor(
    private readonly googleSecretManagerService: GoogleSecretManagerService,
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
      this.googleSecretManagerService.web3RPCHttp,
    );
    return provider;
  }

  getContract(): SmartContract {
    try {
      const contract: SmartContract = this.ethersContract.create(
        this.googleSecretManagerService.escrowContractAddress,
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
        this.googleSecretManagerService.escrowContractAddress,
        escrowContract.abi,
        provider,
      );

      return contract;
    } catch (error) {
      console.log(error);
    }
  }
}
