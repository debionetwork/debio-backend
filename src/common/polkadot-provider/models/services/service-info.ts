import { ExpectedDuration } from 'src/common/mailer/models/lab-register.model/service';
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
