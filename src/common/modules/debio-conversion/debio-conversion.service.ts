import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../secrets';
import axios from 'axios';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Exchange, SodakiExchange } from './models/exchange';
import {
  fetchAllPools,
  ftGetTokenMetadata,
  estimateSwap,
  getExpectedOutputFromSwapTodos,
} from '@ref-finance/ref-sdk';

@Injectable()
export class DebioConversionService {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getCacheExchange() {
    return this.cacheManager.get<Exchange>('exchange');
  }

  async getCacheExchangeFromTo(from: string, to: string) {
    return this.cacheManager.get<number>(`exchange${from}To${to}`);
  }

  async setCacheExchangeFromTo(from: string, to: string) {
    const listApiKey: string[] = this.gCloudSecretManagerService
      .getSecret('COINMARKETCAP_API_KEY')
      .toString()
      .split(',');
    const indexCurrentApiKey: number = await this.cacheManager.get<number>(
      'index_api_key',
    );

    let indexApiKey = 0;

    if (indexCurrentApiKey !== null) {
      indexApiKey = indexCurrentApiKey + 1;

      if (indexApiKey >= listApiKey.length) {
        indexApiKey = 0;
      }
    }

    await this.cacheManager.set<number>('index_api_key', indexApiKey, {
      ttl: 0,
    });

    const apiKey: string = listApiKey[indexApiKey];
    const convertBalanceFromTo = await this.convertBalanceFromTo(
      apiKey,
      1,
      from,
      to,
    );

    await this.cacheManager.set<number>(
      `exchange${from}To${to}`,
      convertBalanceFromTo,
    );

    return convertBalanceFromTo;
  }

  async setCacheExchange() {
    const sodaki = await this.getSodakiExchange();

    const listApiKey: string[] = this.gCloudSecretManagerService
      .getSecret('COINMARKETCAP_API_KEY')
      .toString()
      .split(',');
    const indexCurrentApiKey: number = await this.cacheManager.get<number>(
      'index_api_key',
    );

    let indexApiKey = 0;

    if (indexCurrentApiKey !== null) {
      indexApiKey = indexCurrentApiKey + 1;

      if (indexApiKey >= listApiKey.length) {
        indexApiKey = 0;
      }
    }

    await this.cacheManager.set<number>('index_api_key', indexApiKey, {
      ttl: 0,
    });

    const apiKey: string = listApiKey[indexApiKey];
    const daiToUsd: number = await this.convertDaiToUsd(apiKey, 1);
    const dbioToUsd: number = sodaki.dbioToDai * daiToUsd;

    const exchange: Exchange = new Exchange(sodaki, daiToUsd, dbioToUsd);

    await this.cacheManager.set<Exchange>('exchange', exchange);

    return exchange;
  }

  async getSodakiExchange(): Promise<SodakiExchange> {
    const sodakiExchange: SodakiExchange = new SodakiExchange(null, null, null);

    const { simplePools } = await fetchAllPools();

    const tokenNear = await ftGetTokenMetadata('wrap.near');
    const tokenDAI = await ftGetTokenMetadata(
      '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
    );

    const wNearToDai = await estimateSwap({
      tokenIn: tokenNear,
      tokenOut: tokenDAI,
      amountIn: '1',
      simplePools,
    });

    sodakiExchange.wNearToDai = getExpectedOutputFromSwapTodos(
      wNearToDai,
      tokenDAI.id,
    ).toNumber();

    const tokenDbio = await ftGetTokenMetadata('dbio.near');

    const dbioToWNear = await estimateSwap({
      tokenIn: tokenDbio,
      tokenOut: tokenNear,
      amountIn: '1',
      simplePools,
    });

    sodakiExchange.dbioToWNear = getExpectedOutputFromSwapTodos(
      dbioToWNear,
      tokenNear.id,
    ).toNumber();

    // get dbio to Dai
    // 1 DBIO = x WNear
    // 1 WNear = x DAI
    // result DBIO to WNear * result WNear to DAI = DBIO to DAI
    sodakiExchange.dbioToDai =
      sodakiExchange.dbioToWNear * sodakiExchange.wNearToDai;

    return sodakiExchange;
  }

  async convertDaiToUsd(apiKey: string, daiAmount: number): Promise<number> {
    const response = await axios.get(
      `${this.gCloudSecretManagerService
        .getSecret('COINMARKETCAP_HOST')
        .toString()}/tools/price-conversion`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
        params: {
          amount: daiAmount,
          symbol: 'DAI',
          convert: 'USD',
        },
      },
    );

    return response.data.data[0].quote['USD']['price'];
  }

  async convertBalanceFromTo(
    apiKey: string,
    balanceAmount: number,
    from: string,
    to: string,
  ): Promise<number> {
    const response = await axios.get(
      `${this.gCloudSecretManagerService
        .getSecret('COINMARKETCAP_HOST')
        .toString()}/tools/price-conversion`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
        },
        params: {
          amount: balanceAmount,
          symbol: from.toUpperCase(),
          convert: to.toUpperCase(),
        },
      },
    );

    return response.data.data[0].quote[to.toUpperCase()]['price'];
  }

  async processCacheConversion(): Promise<Exchange> {
    let cacheExchange = await this.getCacheExchange();

    if (cacheExchange) {
      return cacheExchange;
    }

    cacheExchange = await this.setCacheExchange();

    return cacheExchange;
  }

  async processCacheConversionFromTo(from: string, to: string) {
    let cacheExchange = await this.getCacheExchangeFromTo(from, to);

    if (cacheExchange) {
      return cacheExchange;
    }

    cacheExchange = await this.setCacheExchangeFromTo(from, to);

    return cacheExchange;
  }
}
