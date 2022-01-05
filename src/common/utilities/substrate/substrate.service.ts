import { ApiPromise, WsProvider } from '@polkadot/api';
import {
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private _api: ApiPromise;
  private _wsProvider: WsProvider;
  private _listenStatus: boolean;
  private readonly _logger: Logger = new Logger(SubstrateService.name);;

  get api(): ApiPromise {
    return this._api;
  }
 
  async onModuleInit() {
    this._wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    await this.startListen()
  }

  async startListen(){
    if (this._listenStatus) return;

    this._listenStatus = true;
    
    this._api = await ApiPromise.create({
      provider: this._wsProvider,
    });

    this._api.on('connected', () => {
      this._logger.log(`Substrate Listener Connected`);
    });

    this._api.on('disconnected', async () => {
      this._logger.log(`Substrate Listener Disconnected`);
      await this.stopListen();
      await this.startListen();
    });

    this._api.on('error', async (error) => {
      this._logger.log(`Substrate Listener Error: ${error}`);
      await this.stopListen();
      await this.startListen();
    });
  }

  stopListen() {
    this._listenStatus = false;

    if (this._api) {
      delete this._api;
    }
  }
}
