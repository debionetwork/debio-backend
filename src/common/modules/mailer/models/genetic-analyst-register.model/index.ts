import { ApiPromise } from '@polkadot/api';
import { Lab } from '@debionetwork/polkadot-provider';
import {
  getGeneticAnalystRegisterCertification,
  GeneticAnalystRegisterCertification,
} from './certification';
import {
  getGeneticAnalystRegisterService,
  GeneticAnalystRegisterService,
} from './service';

export class GeneticAnalystRegister {
  lab_id: string;
  email: string;
  phone_number: string;
  website: string;
  lab_name: string;
  country: string;
  state: string;
  city: string;
  profile_image: string | undefined;
  address: string;
  certifications: Array<GeneticAnalystRegisterCertification>;
  services: Array<GeneticAnalystRegisterService>;
}

export async function geneticAnalystToGARegister(
  api: ApiPromise,
  lab: Lab,
): Promise<GeneticAnalystRegister> {
  const geneticAnalystRegister = new GeneticAnalystRegister();

  geneticAnalystRegister.lab_id = lab.accountId;
  geneticAnalystRegister.email = lab.info.email;
  geneticAnalystRegister.phone_number = lab.info.phoneNumber;
  geneticAnalystRegister.website = lab.info.website;
  geneticAnalystRegister.lab_name = lab.info.name;
  geneticAnalystRegister.country = lab.info.country;
  geneticAnalystRegister.state = lab.info.region;
  geneticAnalystRegister.city = lab.info.city;
  geneticAnalystRegister.address = lab.info.address;
  geneticAnalystRegister.profile_image = lab.info.profileImage;
  geneticAnalystRegister.certifications =
    await getGeneticAnalystRegisterCertification(api, lab.certifications);
  geneticAnalystRegister.services = await getGeneticAnalystRegisterService(
    api,
    lab.services,
  );

  return geneticAnalystRegister;
}

export * from './service';
export * from './certification';
