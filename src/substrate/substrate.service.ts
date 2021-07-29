import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import spec from './substrateTypes'

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;

  async onModuleInit() {
    Logger.log(' Connecting to substrate chain...');
    console.log(process.env.SUBSTRATE_URL);
    
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({ 
      provider: wsProvider,
      types: spec
    });

  }
}