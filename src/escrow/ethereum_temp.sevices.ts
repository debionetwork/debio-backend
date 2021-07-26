import { Injectable, Logger } from '@nestjs/common';
import * as ABI from './utils/ABI.json';
import {
  EthersSigner,
  WalletSigner,
  SmartContract,
  EthersContract,
} from 'nestjs-ethers';

@Injectable()
export class TestService {
  private readonly logger = new Logger('Ethereum');
  constructor(
    private readonly ethersSigner: EthersSigner,
    private readonly ethersContract: EthersContract,
  ) {}
  async GetAddress(): Promise<string> {
    this.logger.log('Doing something...');
    const wallet: WalletSigner = this.ethersSigner.createWallet(
      '0x86cd3c529eb4d5861e64b628745457c0977d121b97a5e0be05ad0723fda08177',
    );

    return wallet.getAddress();
  }

  async GetContract(): Promise<any> {
    const contract: SmartContract = this.ethersContract.create(
      '0xc578415bAb4cc851f7571678d4f7e4E849FA4737',
      ABI,
    );

    return contract.provider.getNetwork();
  }
}
