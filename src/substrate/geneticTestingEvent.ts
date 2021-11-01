import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { TransactionLoggingService } from '../transaction-logging/transaction-logging.service';
import { SubstrateService } from './substrate.service';
import spec from './substrateTypes.json';

@Injectable()
export default class GeneticTestingEventHandler implements OnModuleInit {
  constructor(
    private readonly loggingService: TransactionLoggingService,
    private substrateService: SubstrateService,
    private api: ApiPromise,
  ) {}

  async onModuleInit() {
    const wsProvider = new WsProvider(process.env.SUBSTRATE_URL);
    this.api = await ApiPromise.create({
      provider: wsProvider,
      types: spec,
    });
  }

  handle(event) {
    switch (event.method) {
      case 'DnaSampleArrived ':
        this.onDnaSampleArrived(event);
        break;
      case 'DnaSampleQualityControlled':
        this.onDnaSampleQualityControlled(event);
        break;
      case 'DnaSampleGenotypedSequenced':
        this.onDnaSampleGenotypedSequenced(event);
        break;
      case 'DnaSampleReviewed':
        this.onDnaSampleReviewed(event);
        break;
      case 'DnaSampleComputed':
        this.onDnaSampleComputed(event);
        break;
      case 'DnaTestResultSubmitted':
        this.onDnaTestResultSubmitted(event);
        break;
      case 'DnaSampleResultReady':
        this.onDnaSampleResultReady(event);
        break;
    }
  }

  onDnaSampleArrived(event) {
    console.log('DnaSampleArrived! TODO: handle event');
  }

  async onDnaSampleQualityControlled(event) {
    try {
      const dataRequest = event.data[0].toJSON();
      const dataOrder = await (
        await this.api.query.orders.orders(dataRequest.order_id)
      ).toJSON();

      interface DataInput {
        address: string;
        amount: bigint;
        create_at: Date;
        currency: string;
        parent_id: bigint;
        ref_number: string;
        transaction_status: number;
        transaction_type: number;
      }

      const dataInput: DataInput = {
        address: dataRequest.owner_id,
        amount: dataOrder['additional_prices'][0].value,
        create_at: new Date(parseInt(dataRequest.updated_at)),
        currency: dataOrder['currency'].toUpperCase(),
        parent_id: BigInt(0),
        ref_number: dataRequest.order_id,
        transaction_status: 3,
        transaction_type: 1,
      };

      this.loggingService.create(dataInput);
    } catch (error) {
      console.log(error);
    }
  }

  onDnaSampleGenotypedSequenced(event) {
    console.log('DnaSampleGenotypedSequenced! TODO: handle event');
  }

  onDnaSampleReviewed(event) {
    console.log('DnaSampleReviewed! TODO: handle event');
  }

  onDnaSampleComputed(event) {
    console.log('DnaSampleComputed TODO: handle event');
  }

  onDnaTestResultSubmitted(event) {
    console.log('DnaTestResultSubmitted! TODO: handle event');
  }

  onDnaSampleResultReady(event) {
    console.log('DnaSampleResultReady! TODO: handle event--->');
  }
}
