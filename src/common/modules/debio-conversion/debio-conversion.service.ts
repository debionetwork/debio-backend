import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ProcessEnvProxy } from '../../../common';

@Injectable()
export class DebioConversionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly process: ProcessEnvProxy
  ) {}

  async getExchange() {
    const ob = await this.httpService.get(`${this.process.env.REDIS_STORE_URL}/cache`, {
      auth: {
        username: this.process.env.REDIS_STORE_USERNAME,
        password: this.process.env.REDIS_STORE_PASSWORD,
      },
    });

    let res;
    ob.subscribe(val => res = val.data);
    return res;
  }
}
