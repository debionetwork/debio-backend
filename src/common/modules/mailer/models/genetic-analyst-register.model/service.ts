import { ApiPromise } from '@polkadot/api';
import { queryServicesByMultipleIds, queryGeneticAnalystServicesByHashId, GeneticAnalystService } from '@debionetwork/polkadot-provider';

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
  const gsrs: Array<GeneticAnalystService> =new Array<GeneticAnalystService>;
  for (let i = 0; i < ids.length; i++) {
    const hashId = ids[i];
    let gaService = await queryGeneticAnalystServicesByHashId(api as any, hashId);
    const tempRS : GeneticAnalystRegisterService = new GeneticAnalystRegisterService();
    tempRS.currency = gaService.info.pricesByCurrency[0].currency;
    tempRS.description = gaService.info.description;
    tempRS.expected_duration = `${gaService.info.expectedDuration.duration} ${gaService.info.expectedDuration.durationType}`;
    tempRS.name = gaService.info.name;
    tempRS.price = gaService.info.pricesByCurrency[0].totalPrice.toString();
    tempRS.test_result_sample = gaService.info.testResultSample;

    geneticAnalystRegisterServices.push(tempRS);
  }

  return geneticAnalystRegisterServices;
}
