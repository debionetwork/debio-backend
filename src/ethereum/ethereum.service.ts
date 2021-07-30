import { Injectable } from '@nestjs/common';
import { EthersContract, SmartContract } from 'nestjs-ethers';
import {
  getFile,
  createFile,
  checkIfFileOrDirectoryExists,
} from '../helper/storage.helper';
import * as ABI from './utils/ABI.json';

@Injectable()
export class EthereumBlockService {
  constructor(private readonly ethersContract: EthersContract) {}

  async onModuleInit() {
    console.log('Di EthereumBlockService');
  }

  async getLastBlock(): Promise<number> {
    let lastBlock = 0;
    const filePath = 'file/lastblock.txt';
    if (!checkIfFileOrDirectoryExists(filePath)) {
      await createFile('file', 'lastblock.txt', '0');
    } else {
      const strLastBlock = await getFile(filePath, 'utf8');
      lastBlock = parseInt(strLastBlock.toString(), 10);
    }
    return lastBlock;
  }

  async setLastBlock(blockNumber) {
    await createFile('file', 'lastblock.txt', blockNumber.toString());
  }

  async getContract(): Promise<any> {
    try {
      const contract: SmartContract = this.ethersContract.create(
        '0xc578415bAb4cc851f7571678d4f7e4E849FA4737',
        ABI,
      );

      contract.provider.addListener(
        'Transfer',
        async (from, to, amount, event) => {
          console.log(from);
        },
      );

      console.log('block number: ', await contract.provider.getBlockNumber());
      return contract;
    } catch (error) {
      console.log(error);
    }
  }
}
