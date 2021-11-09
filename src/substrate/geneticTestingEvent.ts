import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { RewardDto } from '../reward/dto/reward.dto';
import { DbioBalanceService } from '../dbio-balance/dbio_balance.service';
import { RewardService } from '../reward/reward.service';
import { TransactionLoggingService } from '../transaction-logging/transaction-logging.service';
import { SubstrateService } from './substrate.service';

@Injectable()
export default class GeneticTestingEventHandler implements OnModuleInit {
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private readonly rewardService: RewardService,
    private dbioBalanceService: DbioBalanceService,
    private substrateService: SubstrateService,
    private api: ApiPromise,
  ) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
    });
  }

  handle(event) {
    switch (event.method) {
      case 'DnaSampleRegistered':
        this.onDnaSampleRegistered(event);
        break;
      case 'DnaSampleArrived ':
        this.onDnaSampleArrived(event);
        break;
      case 'DnaSampleRejected':
        this.onDnaSampleRejected(event);
        break;
      case 'DnaSampleQualityControlled':
        this.onDnaSampleQualityControlled(event);
        break;
      case 'DnaSampleResultReady':
        this.onDnaSampleResultReady(event);
        break;
      case 'DnaTestResultSubmitted':
        this.onDnaTestResultSubmitted(event);
        break;
      case 'DataStaked':
        this.onDataStaked(event);
        break;
    }
  }
  onDnaSampleRegistered(event) {
    console.log('DnaSampleRegistered!');
  }
  
  onDnaSampleArrived(event) {
    console.log('DnaSampleArrived!');
  }
  
  onDnaSampleRejected(event) {
    console.log('DnaSampleRejected!');
  }

  async onDnaSampleQualityControlled(event) {
    console.log('DnaSampleQualityControlled!');
  }
  
  onDnaSampleResultReady(event) {
    console.log('DnaSampleResultReady');
  }

  onDnaTestResultSubmitted(event) {
    console.log('DnaTestResultSubmitted');
  }

  async onDataStaked(event) {
    console.log('DataStaked');
    const dataStaked = event.data[0].toJSON();
    const dataOrder = await (
      await this.api.query.orders.orders(dataStaked.order_id)
    ).toJSON();

    const debioToDai = Number((await this.dbioBalanceService.getDebioBalance()).dai)
    const rewardPrice = dataOrder['price'][0].value * debioToDai

    //send reward
    await this.substrateService.sendReward(dataOrder['customer_id'], rewardPrice)
    
     // Write Logging Reward Customer Staking Request Service
     const dataCustomerLoggingInput: RewardDto = {
      address: dataOrder['customer_id'],
      ref_number: dataOrder['id'],
      reward_amount: rewardPrice,
      reward_type: 'Customer Add Data as Bounty',
      currency: 'DBIO',
      created_at: new Date()
    }
    await this.rewardService.insert(dataCustomerLoggingInput)
  }
}
