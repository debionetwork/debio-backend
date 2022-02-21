import { CurrencyType, Price } from '..';
import {
  convertSubstrateBalanceToNumber,
  convertSubstrateNumberToNumber,
} from '../..';
import { GeneticAnalysisOrderStatus } from './genetic-analysis-order-status';

export class GeneticAnalystOrder {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.service_id = anyJson.serviceId;
    this.customer_id = anyJson.customerId;
    this.customer_box_public_key = anyJson.customerBoxPublicKey;
    this.seller_id = anyJson.sellerId;
    this.genetic_data_id = anyJson.geneticDataId;
    this.genetic_analysis_tracking_id = anyJson.geneticAnalysisTrackingId;
    this.currency = anyJson.currency;
    this.prices = anyJson.prices;
    this.additional_prices = anyJson.additionalPrices;
    this.status = anyJson.status;
    this.created_at = anyJson.createdAt;
    this.updated_at = anyJson.updatedAt;
  }
  id: string;
  service_id: string;
  customer_id: string;
  customer_box_public_key: string;
  seller_id: string;
  genetic_data_id: string;
  genetic_analysis_tracking_id: string;
  currency: CurrencyType;
  prices: Price[];
  additional_prices: Price[];
  status: GeneticAnalysisOrderStatus;
  created_at: Date;
  updated_at: Date;

  humanToGeneticAnalysisOrderListenerData() {
    const geneticAnalysisOrder : GeneticAnalystOrder = this; // eslint-disable-line

    if (geneticAnalysisOrder.prices[0].value) {
      geneticAnalysisOrder.prices[0].value = convertSubstrateBalanceToNumber(
        geneticAnalysisOrder.prices[0].value,
      );
    }

    geneticAnalysisOrder.created_at = new Date(
      convertSubstrateNumberToNumber(geneticAnalysisOrder.created_at),
    );

    if (geneticAnalysisOrder.updated_at) {
      geneticAnalysisOrder.updated_at = new Date(
        convertSubstrateNumberToNumber(geneticAnalysisOrder.updated_at),
      );
    }

    return geneticAnalysisOrder;
  }
}

export * from './genetic-analysis-order-status';
