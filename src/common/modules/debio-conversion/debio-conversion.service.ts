import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { Injectable, Logger } from '@nestjs/common';
import { ProcessEnvProxy } from '../proxies';
import axios from 'axios';

@Injectable()
export class DebioConversionService {
  private readonly logger: Logger = new Logger(DebioConversionService.name);
  constructor(
    private readonly process: ProcessEnvProxy,
    private readonly gCloudSecretManagerService: GCloudSecretManagerService,
  ) {}

  async getExchange() {
    try {
      const res = await axios.get(`${this.process.env.REDIS_STORE_URL}/cache`, {
        auth: {
          username: this.gCloudSecretManagerService
            .getSecret('REDIS_STORE_USERNAME')
            .toString(),
          password: this.gCloudSecretManagerService
            .getSecret('REDIS_STORE_PASSWORD')
            .toString(),
        },
      });

      return res.data;
    } catch (error) {
      await this.logger.log(`API conversion": ${error.message}`);
    }
  }
}
