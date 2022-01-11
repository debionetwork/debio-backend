import { ApiPromise } from "@polkadot/api";
import { queryServicesByMultipleIds } from "../../../../polkadot-provider";

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

export async function getLabRegisterService(api: ApiPromise, ids: string[]): Promise<Array<LabRegisterService>> {
  const services = await queryServicesByMultipleIds(api, ids);
  const labRegisterServices: Array<LabRegisterService> =
    new Array<LabRegisterService>();

  services.forEach((val) => {
    const lrs: LabRegisterService = new LabRegisterService();
    lrs.name = val.info.name;
    lrs.category = val.info.category;
    lrs.price = val.price;
    lrs.qc_price = val.qc_price;
    lrs.description = val.info.description;
    lrs.long_description = val.info.longDescription;
    lrs.test_result_sample = val.info.testResultSample;
    lrs.expected_duration.duration = val.info.expectedDuration.duration;
    lrs.expected_duration.duration_type = val.info.expectedDuration.durationType;
    labRegisterServices.push(lrs);
  });

  return labRegisterServices;
}
