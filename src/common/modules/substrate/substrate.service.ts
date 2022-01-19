import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ProcessEnvProxy } from '../proxies';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private _api: ApiPromise;
  private _pair: any;
  private _wsProvider: WsProvider;
  private _listenStatus: boolean;
  private readonly _logger: Logger = new Logger(SubstrateService.name);

  constructor(private readonly process: ProcessEnvProxy) {}

  get api(): ApiPromise {
    return this._api;
  }

  get pair(): any {
    return this._pair;
  }

  async onModuleInit() {
    this._wsProvider = new WsProvider(this.process.env.SUBSTRATE_URL);

    const keyring = new Keyring({ type: 'sr25519' });
    this._pair = await keyring.addFromUri(
      this.process.env.ADMIN_SUBSTRATE_MNEMONIC,
    );

    await this.startListen();
  }

  async startListen() {
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
