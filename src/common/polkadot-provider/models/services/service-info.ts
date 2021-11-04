import { ExpectedDuration } from 'src/common/mailer/models/lab-register.model/service';
import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  name: string;
  category: string;
  description: string;
  prices_by_currency: PriceByCurrency[];
  expected_duration: ExpectedDuration;
  test_result_sample: string;
  long_description?: string;
  image?: string;
  dna_collection_process?: string;
  price?: string;
}
