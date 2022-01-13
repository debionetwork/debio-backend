import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ProcessEnvProxy } from '../../proxies/process-env';

@Injectable()
export class DebioConversionService {
  constructor(
    private readonly process: ProcessEnvProxy
  ) {}

  async getExchange() {
    const res = await axios.get(
      `${this.process.env.REDIS_STORE_URL}/cache` ,
      { 
        auth: {
          username: this.process.env.REDIS_STORE_USERNAME,
          password: this.process.env.REDIS_STORE_PASSWORD,
        },
      },
    );
    
    return res.data;
  }
}
