import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Option } from '@polkadot/types';
import { EscrowService } from '../escrow/escrow.service';
import { RegistrationRole } from './substrate.controller';
import GeneticTestingEventHandler from './geneticTestingEvent';
import { TransactionLoggingService } from '../transaction-logging/transaction-logging.service';
import { DbioBalanceService } from 'src/dbio-balance/dbio_balance.service';
import { RewardService } from '../reward/reward.service';
import { OrderEventHandler } from './orderEvent';
import { ServiceEventHandler } from './serviceEvent';
import { MailerManager } from 'src/common/mailer/mailer.manager';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private escrowWallet: any;
  private faucetWallet: KeyringPair;
  private sudoWallet: KeyringPair;
  private orderEventHandler: OrderEventHandler;
  private geneticTestingEventHandler: GeneticTestingEventHandler;
  private serviceEventHandler: ServiceEventHandler;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  private substrateService: SubstrateService;
  private dbioBalanceService: DbioBalanceService;
  private rewardService: RewardService;

  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
    private mailerManager: MailerManager,
    private readonly transactionLoggingService: TransactionLoggingService,
  ) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
    });

    const keyring = new Keyring({ type: 'sr25519' });
    this.escrowWallet = await keyring.addFromUri(
      process.env.ESCROW_SUBSTRATE_MNEMONIC,
    );
    this.faucetWallet = await keyring.addFromUri(
      process.env.FAUCET_SUBSTRATE_MNEMONIC,
    );
    this.sudoWallet = await keyring.addFromUri(
      process.env.SUDO_SUBSTRATE_MNEMONIC,
    );

    this.orderEventHandler = new OrderEventHandler(
      this.escrowService,
      this.api,
      this.logger,
      this.substrateService,
      this.dbioBalanceService,
      this.rewardService,
      this.transactionLoggingService
    );

    this.geneticTestingEventHandler = new GeneticTestingEventHandler(
      this.transactionLoggingService,
      this.rewardService,
      this.dbioBalanceService,
      this.substrateService,
      this.api,
    );

    this.serviceEventHandler = new ServiceEventHandler(
      this.api,
      this.mailerManager
    );
  }

  async getSubstrateAddressByEthAddress(ethAddress: string) {
    const response = await this.api.query.userProfile.accountIdByEthAddress(
      ethAddress,
    );

    return response.toString();
  }

  async getLastOrderByCustomer(substrateAddress: string) {
    const response = await this.api.query.orders.lastOrderByCustomer(
      substrateAddress,
    );

    return response.toString();
  }

  async getOrderDetailByOrderID(orderID: string) {
    const response = await this.api.query.orders.orders(orderID);
    return response.toHuman();
  }

  // get balance of account
  async getBalanceAccount(accountId: string) {
    const { data: balance } = await this.api.query.system.account(accountId);

    const chainDecimal = this.api.registry.chainDecimals;
    const decimalBalance =
      Number(balance.free.toBigInt()) / Math.pow(10, chainDecimal[0]);

    return decimalBalance;
  }

  async setOrderPaid(orderId: string) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.orders
      .setOrderPaid(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  async setOrderRefunded(orderId: string) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.orders
      .setOrderRefunded(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  async sendDbioFromFaucet(
    accountId: string,
    amount: number | string,
  ): Promise<any> {
    const wallet = this.faucetWallet;

    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.balances
        .transfer(accountId, amount)
        .signAndSend(wallet, { nonce: -1 }, (result) => {
          if (result.status.isInBlock) {
            this.logger.log(
              `Transaction included at blockHash ${result.status.asInBlock}`,
            );
          } else if (result.status.isFinalized) {
            this.logger.log(
              `Transaction finalized at blockHash ${result.status.asFinalized}`,
            );
            unsub();
            resolve(true);
          }
        });
    });
  }

  async hasRole(accountId: string, role: RegistrationRole): Promise<boolean> {
    let hasRole = false;
    let resp: any;
    switch (role) {
      case 'doctor':
        resp = await this.api.query.doctors.doctors(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
      case 'hospital':
        resp = await this.api.query.hospitals.hospitals(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
      case 'lab':
        resp = await this.api.query.labs.labs(accountId);
        if ((resp as Option<any>).isSome) {
          hasRole = true;
        }
    }

    return hasRole;
  }

  listenToEvents() {
    this.api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;
        switch (
          event.section // event.section == pallet name
        ) {
          case 'services':
            this.serviceEventHandler.handle(event);
            break;
          case 'orders':
            this.orderEventHandler.handle(event);
            break;
          case 'geneticTesting':
            this.geneticTestingEventHandler.handle(event);
            break;
        }
      });
    });
  }

  async bindEthAddressToSubstrateAddress(
    ethAddress: string,
    substrateAddress: string,
  ) {
    const wallet = this.sudoWallet;

    return new Promise(async (resolve) => {
      const unsub = await this.api.tx.sudo
        .sudo(
          this.api.tx.userProfile.sudoSetEthAddress(
            substrateAddress,
            ethAddress,
          ),
        )
        .signAndSend(this.sudoWallet, { nonce: -1 }, (result) => {
          if (result.status.isInBlock) {
            this.logger.log(
              `Transaction included at blockHash ${result.status.asInBlock}`,
            );
          } else if (result.status.isFinalized) {
            this.logger.log(
              `Transaction finalized at blockHash ${result.status.asFinalized}`,
            );
            unsub();
            resolve(true);
          }
        });
    });
  }

  async submitStaking(hash: String, orderId: String) {
    const wallet = this.escrowWallet;
    const response = await this.api.tx.geneticTesting
      .submitDataBountyDetails(hash, orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });
    console.log(response);
  }

  async sendReward(
    acountId: string,
    amount: number | string
    ) {      
    const wallet = this.escrowWallet;    
    const response = await this.api.tx.rewards
      .rewardFunds(
        acountId,
        amount
      )
      .signAndSend(wallet, {
        nonce: -1,
      });

    console.log(response);
  }

  async verificationLabWithSubstrate(
    acountId: string,
    labStatus:  string
    ) {      
      const wallet = this.sudoWallet;    
    const response = await this.api.tx.labs
      .updateLabVerificationStatus(
        acountId,
        labStatus
      )
      .signAndSend(wallet, {
        nonce: -1,
      });
      
    console.log(response);
  }
}