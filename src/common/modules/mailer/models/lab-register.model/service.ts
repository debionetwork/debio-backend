import { ApiPromise } from '@polkadot/api';
import { queryServicesByMultipleIds } from '@debionetwork/polkadot-provider';
import currencyUnit from '../currency';

export class LabRegisterExpectedDuration {
  duration: string;
  duration_type: string;
}

export class LabRegisterService {
  category: string;
  name: string;
  currency: string;
  price: string;
  qc_price: string;
  description: string;
  long_description: string;
  supporting_document: string;
  test_result_sample: string;
  expected_duration: LabRegisterExpectedDuration;
}

export async function getLabRegisterService(
  api: ApiPromise,
  ids: string[],
): Promise<Array<LabRegisterService>> {
  const services = await queryServicesByMultipleIds(api as any, ids);
  const labRegisterServices: Array<LabRegisterService> =
    new Array<LabRegisterService>();

  services.forEach((val) => {
    const lrs: LabRegisterService = new LabRegisterService();
    const expectedDuration = new LabRegisterExpectedDuration();
    expectedDuration.duration = val.info.expectedDuration.duration;
    expectedDuration.duration_type = val.info.expectedDuration.durationType;

    lrs.name = val.info.name;
    lrs.category = val.info.category;
    lrs.currency = val.currency;
    const currType = currencyUnit[val.currency];
    lrs.price = (Number(val.price.split(',').join('')) / currType)
      .toFixed(4)
      .replace('.', ',');
    lrs.qc_price = (Number(val.qcPrice.split(',').join('')) / currType)
      .toFixed(4)
      .replace('.', ',');
    lrs.description = val.info.description;
    lrs.long_description = val.info.longDescription;
    lrs.test_result_sample = val.info.testResultSample;
    lrs.expected_duration = expectedDuration;

    labRegisterServices.push(lrs);
  });

  return labRegisterServices;
}
