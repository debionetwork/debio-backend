import { ExpectedDuration } from './expected-duration';
import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  name: string;
  category: string;
  description: string;
  pricesByCurrency: PriceByCurrency[];
  expectedDuration: ExpectedDuration;
  testResultSample: string;
  longDescription?: string;
  image?: string;
  dnaCollectionProcess?: string;
  price?: string;
}
