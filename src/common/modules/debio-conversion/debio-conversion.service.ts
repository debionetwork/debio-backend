import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../secrets';
import axios from 'axios';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Exchange, SodakiExchange } from './models/exchange';

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
    return this.cacheManager.get(`exchange${from}To${to}`);
  }

  async setCacheExchangeFromTo(from: string, to: string) {
    const listApiKey: string[] = this.gCloudSecretManagerService
      .getSecret('API_KEY_COINMARKETCAP')
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

    await this.cacheManager.set(`exchange${from}To${to}`, convertBalanceFromTo);

    return convertBalanceFromTo;
  }

  async setCacheExchange() {
    const sodaki = await this.getSodakiExchange();

    const listApiKey: string[] = this.gCloudSecretManagerService
      .getSecret('API_KEY_COINMARKETCAP')
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
    const response = await axios.get(
      this.gCloudSecretManagerService.getSecret('SODAKI_HOST').toString(),
    );

    const sodakiExchange: SodakiExchange = new SodakiExchange(null, null, null);
    for (let i = 0; i < response.data.length; i++) {
      if (
        sodakiExchange.dbioToWNear !== null &&
        sodakiExchange.wNearToDai !== null
      ) {
        break;
      }

      const item = response.data[i];

      // check if dbioToWNear is null
      // current data fiatInfo symbol is wNEAR
      // current data assetInfo symbol is DBIO
      if (
        sodakiExchange.dbioToWNear === null &&
        item.fiatInfo.symbol === 'wNEAR' &&
        item.assetInfo.symbol === 'DBIO'
      ) {
        // pass value from current data price to dbioToWNear
        sodakiExchange.dbioToWNear = parseFloat(item.price);
      }

      // check if wNearToDai is null
      // current data fiatInfo symbol is DAI
      // current data assetInfo symbol is wNEAR
      if (
        sodakiExchange.wNearToDai === null &&
        item.fiatInfo.symbol === 'DAI' &&
        item.assetInfo.symbol === 'wNEAR'
      ) {
        // pass value from current data price to wNearToDai
        sodakiExchange.wNearToDai = parseFloat(item.price);
      }
    }

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
