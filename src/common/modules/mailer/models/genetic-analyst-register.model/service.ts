import { ApiPromise } from '@polkadot/api';
import {
  queryGeneticAnalystServicesByHashId,
  GeneticAnalystService,
} from '@debionetwork/polkadot-provider';
import currencyUnit from '../currency';

export class GeneticAnalystRegisterExpectedDuration {
  duration: string;
  duration_type: string;
}

export class GeneticAnalystRegisterService {
  name: string;
  currency: string;
  price: string;
  description: string;
  long_description: string | undefined;
  test_result_sample: string;
  expected_duration: string;
}

export async function getGeneticAnalystRegisterServices(
  api: ApiPromise,
  ids: string[],
): Promise<Array<GeneticAnalystRegisterService>> {
  const geneticAnalystRegisterServices: Array<GeneticAnalystRegisterService> =
    new Array<GeneticAnalystRegisterService>();
  const gsrs: Array<GeneticAnalystService> = new Array<GeneticAnalystService>(); // eslint-disable-line
  for (let i = 0; i < ids.length; i++) {
    const hashId = ids[i];
    const gaService = await queryGeneticAnalystServicesByHashId(
      api as any,
      hashId,
    );
    const tempRS: GeneticAnalystRegisterService =
      new GeneticAnalystRegisterService();
    tempRS.currency = gaService.info.pricesByCurrency[0].currency;
    tempRS.description = gaService.info.description;
    tempRS.expected_duration = `${gaService.info.expectedDuration.duration} ${gaService.info.expectedDuration.durationType}`;
    tempRS.name = gaService.info.name;
    const currType = currencyUnit[tempRS.currency];
    tempRS.price = (
      Number(gaService.info.pricesByCurrency[0].totalPrice) / currType
    ).toFixed(4);
    tempRS.test_result_sample = gaService.info.testResultSample;

    geneticAnalystRegisterServices.push(tempRS);
  }

  return geneticAnalystRegisterServices;
}
