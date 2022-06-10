import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GoogleSecretManagerService } from '../google-secret-manager';

@Injectable()
export class DebioConversionService {
  private readonly logger: Logger = new Logger(DebioConversionService.name);
  constructor(
    private readonly googleSecretManagerService: GoogleSecretManagerService,
  ) {}

  async getExchange() {
    try {
      const res = await axios.get(
        `${this.googleSecretManagerService.redisStoreUrl}/cache`,
        {
          auth: {
            username: this.googleSecretManagerService.redisStoreUsername,
            password: this.googleSecretManagerService.redisStorePassword,
          },
        },
      );

      return res.data;
    } catch (error) {
      await this.logger.log(`API conversion": ${error.message}`);
    }
  }
}
