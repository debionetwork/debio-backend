import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Option } from '@polkadot/types';
import { EscrowService } from '../escrow/escrow.service';
import { RegistrationRole } from './dto/get-dbio-on-register.dto';
import GeneticTestingEventHandler from '../../substrate/geneticTestingEvent';
import { TransactionLoggingService } from '../../common/utilities/transaction-logging/transaction-logging.service';
import { RewardService } from '../../common/utilities/reward/reward.service';
import { OrderEventHandler } from '../../substrate/orderEvent';
import { ServiceEventHandler } from '../../substrate/serviceEvent';
import { MailerManager } from '../../common/utilities/mailer/mailer.manager';
import { ServiceRequestEventHandler } from '../../substrate/serviceRequestEvent';
import { CountryService } from '../location/country.service';
import { StateService } from '../location/state.service';
import { DebioConversionService } from '../../common/utilities/debio-conversion/debio-conversion.service';

@Injectable()
export class SubstrateService implements OnModuleInit {
  private api: ApiPromise;
  private adminWallet: any;
  private orderEventHandler: OrderEventHandler;
  private geneticTestingEventHandler: GeneticTestingEventHandler;
  private serviceRequestEventHandler: ServiceRequestEventHandler;
  private serviceEventHandler: ServiceEventHandler;
  private readonly logger: Logger = new Logger(SubstrateService.name);
  private substrateService: SubstrateService;
  private exchangeCacheService: DebioConversionService;
  private rewardService: RewardService;
  private listenStatus = false;
  private wsProvider: WsProvider;

  constructor(
    @Inject(forwardRef(() => EscrowService))
    private escrowService: EscrowService,
    private mailerManager: MailerManager,
    private readonly transactionLoggingService: TransactionLoggingService,
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
  ) {}

  async onModuleInit() {
    this.wsProvider = new WsProvider(process.env.SUBSTRATE_URL);

    const keyring = new Keyring({ type: 'sr25519' });
    this.adminWallet = await keyring.addFromUri(
      process.env.ADMIN_SUBSTRATE_MNEMONIC,
    );

    this.orderEventHandler = new OrderEventHandler(
      this.escrowService,
      this.api,
      this.logger,
      this.substrateService,
      this.exchangeCacheService,
      this.rewardService,
      this.transactionLoggingService,
    );

    this.geneticTestingEventHandler = new GeneticTestingEventHandler(
      this.rewardService,
      this.exchangeCacheService,
      this.substrateService,
      this.api,
    );

    this.serviceEventHandler = new ServiceEventHandler(
      this.api,
      this.mailerManager,
    );

    this.serviceRequestEventHandler = new ServiceRequestEventHandler(
      this.countryService,
      this.stateService,
      this.api,
      this.mailerManager,
      this.transactionLoggingService,
      this.logger,
    );

    await this.startListen()
  }

  async setOrderPaid(orderId: string) {
    const wallet = this.adminWallet;
    const response = await this.api.tx.orders
      .setOrderPaid(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    await this.logger.log('set order paid', orderId);
  }

  async setOrderRefunded(orderId: string) {
    const wallet = this.adminWallet;
    const response = await this.api.tx.orders
      .setOrderRefunded(orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });

    await this.logger.log('set order refunded', orderId);
  }

  async bindEthAddressToSubstrateAddress(
    ethAddress: string,
    substrateAddress: string,
  ) {
    const wallet = this.adminWallet;
    const response = await   this.api.tx.userProfile.adminSetEthAddress(
      substrateAddress,
      ethAddress,
    )
    .signAndSend(wallet, {
      nonce: -1,
    });
    return response.toJSON()
  }

  async submitStaking(hash: string, orderId: string) {
    const wallet = this.adminWallet;
    const response = await this.api.tx.geneticTesting
      .submitDataBountyDetails(hash, orderId)
      .signAndSend(wallet, {
        nonce: -1,
      });
    await this.logger.log("Submit Data Bounty", orderId);
  }

  async sendReward(acountId: string, amount: number) {
    const wallet = this.adminWallet;
    const dbioUnit = 10 ** 18;
    const response = await this.api.tx.rewards
      .rewardFunds(acountId, (amount * dbioUnit).toString())
      .signAndSend(wallet, {
        nonce: -1,
      });

    await this.logger.log(`Send Reward ${amount} DBIO to ${acountId}`);
  }

  async verificationLabWithSubstrate(acountId: string, labStatus: string) {
    const wallet = this.adminWallet;
    const response = await this.api.tx.labs
      .updateLabVerificationStatus(acountId, labStatus)
      .signAndSend(wallet, {
        nonce: -1,
      });

    await this.logger.log(`lab ${acountId} is ${labStatus}`);
  }

  async retrieveUnstakedAmount(requestId) {
    const wallet = this.adminWallet;
    const response = await this.api.tx.serviceRequest
    .retrieveUnstakedAmount(requestId)
    .signAndSend(wallet, {
      nonce: -1,
    });

    await this.logger.log('retrieve unstaked amount', requestId);
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
          case 'serviceRequest':
            this.serviceRequestEventHandler.handle(event);
            break;
        }
      });
    });
  }

  async startListen(){
    if (this.listenStatus) return;

    this.listenStatus = true;
    
    this.api = await ApiPromise.create({
      provider: this.wsProvider,
    });

    this.api.on('connected', () => {
      this.logger.log(`Substrate Listener Connected`);
    });

    this.api.on('disconnected', async () => {
      this.logger.log(`Substrate Listener Disconnected`);
      await this.stopListen();
      await this.startListen();
    });

    this.api.on('error', async (error) => {
      this.logger.log(`Substrate Listener Error: ${error}`);
      await this.stopListen();
      await this.startListen();
    });
  }

  stopListen() {
    this.listenStatus = false;

    if (this.api) {
      delete this.api;
    }
  }
}
