import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CachesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getLastBlock(): Promise<number> {
    const lastBlock = await this.cacheManager.get<number>('last-block');

    if (!lastBlock) {
      return 0;
    }

    return lastBlock;
  }

  async setLastBlock(blockNumber: number): Promise<number> {
    return await this.cacheManager.set<number>('last-block', blockNumber);
  }
}
