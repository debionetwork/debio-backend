import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ProcessEnvProxy } from '../proxies';

@Injectable()
export class DebioConversionService {
  private readonly logger: Logger = new Logger(DebioConversionService.name);
  constructor(private readonly process: ProcessEnvProxy) {}

  async getExchange() {
    try {
      const res = await axios.get(`${this.process.env.REDIS_STORE_URL}/cache`, {
        auth: {
          username: this.process.env.REDIS_STORE_USERNAME,
          password: this.process.env.REDIS_STORE_PASSWORD,
        },
      });

      return res.data;
    } catch (error) {
      await this.logger.log(`API conversion": ${error.message}`);
    }
  }
}
