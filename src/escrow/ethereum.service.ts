import { EMPTY, Observable } from 'rxjs';
import { Logger } from '@nestjs/common';
import {
  CustomTransportStrategy,
  MessageHandler,
  Server,
} from '@nestjs/microservices';
import Web3 from 'web3';
import { Block, BlockHeader } from 'web3-eth/types';
export class EthereumServer extends Server implements CustomTransportStrategy {
  private subscription: any;
  readonly logger = new Logger('Ethereum');
  public listen(callback: () => void): void {
    this.logger.log('Doing something...');
    this.listenToBlocks();
    callback();
  }

  private listenToBlocks(): void {
    const web3: Web3 = new Web3(
      new Web3.providers.WebsocketProvider('wss://testnet.theapps.dev/node'),
    );
    this.subscription = web3.eth.subscribe(
      'newBlockHeaders',
      (error: Error, blockHeader: BlockHeader) => {
        if (error) {
          console.error(error);
          return;
        }

        web3.eth.getBlock(blockHeader.number).then(async (block: Block) => {
          return this.call('BLOCK', block).then((observable) => {
            observable.subscribe(console.log);
          });
        });
      },
    );
  }

  private call(pattern: string, data: Block): Promise<Observable<any>> {
    const handler: MessageHandler | undefined =
      this.messageHandlers.get(pattern);

    if (!handler) {
      return Promise.resolve(EMPTY);
    }

    return handler(data);
  }

  public close(): void {
    this.subscription.unsubscribe();
  }
}
