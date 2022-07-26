import { ApiPromise } from '@polkadot/api';
import { queryServicesByMultipleIds } from '@debionetwork/polkadot-provider';

export class GeneticAnalystRegisterExpectedDuration {
  duration: string;
  duration_type: string;
}

export class GeneticAnalystRegisterService {
  category: string;
  name: string;
  currency: string;
  price: string;
  qc_price: string;
  description: string;
  long_description: string | undefined;
  supporting_document: string;
  test_result_sample: string;
  expected_duration: GeneticAnalystRegisterExpectedDuration;
}

export async function getGeneticAnalystRegisterService(
  api: ApiPromise,
  ids: string[],
): Promise<Array<GeneticAnalystRegisterService>> {
  const services = await queryServicesByMultipleIds(api as any, ids);
  const geneticAnalystRegisterServices: Array<GeneticAnalystRegisterService> =
    new Array<GeneticAnalystRegisterService>();

  services.forEach((val) => {
    const lrs: GeneticAnalystRegisterService =
      new GeneticAnalystRegisterService();
    const expectedDuration = new GeneticAnalystRegisterExpectedDuration();
    expectedDuration.duration = val.info.expectedDuration.duration;
    expectedDuration.duration_type = val.info.expectedDuration.durationType;

    lrs.name = val.info.name;
    lrs.category = val.info.category;
    lrs.currency = val.currency;
    lrs.price = (Number(val.price.split(',').join('')) / 10 ** 18).toString();
    lrs.qc_price = (
      Number(val.qcPrice.split(',').join('')) /
      10 ** 18
    ).toString();
    lrs.description = val.info.description;
    lrs.long_description = val.info.longDescription;
    lrs.test_result_sample = val.info.testResultSample;
    lrs.expected_duration = expectedDuration;

    geneticAnalystRegisterServices.push(lrs);
  });

  return geneticAnalystRegisterServices;
}
