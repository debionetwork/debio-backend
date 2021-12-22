import { Price } from './price';

export class PriceByCurrency {
  currency: string;
  totalPrice: number;
  priceComponents: Price[];
  additionalPrices: Price[];
}
