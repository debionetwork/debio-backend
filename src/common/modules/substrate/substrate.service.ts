import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { waitReady } from '@polkadot/wasm-crypto';
import { GCloudSecretManagerService } from '@debionetwork/nestjs-gcloud-secret-manager';
import { keyList } from '../../secrets';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private _api: ApiPromise;
  private _pair: any;
  private _wsProvider: WsProvider;
  private _listenStatus: boolean;
  private readonly _logger: Logger = new Logger(SubstrateService.name);

  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) {}

  get api(): ApiPromise {
    return this._api;
  }

  get pair(): any {
    return this._pair;
  }

  async onModuleInit() {
    this._wsProvider = new WsProvider(
      this.gCloudSecretManagerService.getSecret('SUBSTRATE_URL').toString(),
    );

    const keyring = new Keyring({ type: 'sr25519' });
    await waitReady();

    this._pair = await keyring.addFromUri(
      this.gCloudSecretManagerService
        .getSecret('ADMIN_SUBSTRATE_MNEMONIC')
        .toString(),
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
      if (this._listenStatus) {
        await this.stopListen();
        await this.startListen();
      }
    });

    this._api.on('error', async (error) => {
      this._logger.log(`Substrate Listener Error: ${error}`);
      await this.stopListen();
      await this.startListen();
    });
  }

  async stopListen() {
    if (!this._listenStatus) return;
    this._listenStatus = false;

    if (this._api) {
      delete this._api;
    }
  }

  destroy() {
    this._listenStatus = false;

    if (this._api) {
      delete this._api;
    }

    if (this._wsProvider) {
      delete this._wsProvider;
    }
  }
}
