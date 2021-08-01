import { Injectable } from '@nestjs/common';
import { EthersContract, SmartContract } from 'nestjs-ethers';
import {
  getFile,
  createFile,
  checkIfFileOrDirectoryExists,
} from '../helper/storage.helper';
import ABI from './utils/ABI.json';

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
        process.env.CONTRACT_ADDRESS,
        ABI,
      );

      console.log('block number: ', await contract.provider.getBlockNumber());
      return contract;
    } catch (error) {
      console.log(error);
    }
  }
}
