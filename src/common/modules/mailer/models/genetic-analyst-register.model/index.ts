import { ApiPromise } from '@polkadot/api';
import { GeneticAnalyst, GeneticAnalystService } from '@debionetwork/polkadot-provider';
import {
  getGeneticAnalystRegisterCertifications,
} from './certification';
import {
  getGeneticAnalystRegisterServices,
  GeneticAnalystRegisterService,
} from './service';
import { GeneticAnalystQualificationCertification } from '@debionetwork/polkadot-provider/lib/models/genetic-analysts/genetic-analyst-qualification/genetic-analyst-qualification-certification';

export class GeneticAnalystRegister {
  genetic_analyst_id: string;
  email: string;
  phone_number: string;
  profile_link: string;
  genetic_analyst_name: string;
  profile_image: string | undefined;
  gender: string;
  certifications: Array<GeneticAnalystQualificationCertification>;
  services: Array<GeneticAnalystRegisterService>;
}

export async function geneticAnalystToGARegister(
  api: ApiPromise,
  genetic_analyst: GeneticAnalyst,
): Promise<GeneticAnalystRegister> {
  const geneticAnalystRegister = new GeneticAnalystRegister();

  geneticAnalystRegister.genetic_analyst_id = genetic_analyst.accountId;
  geneticAnalystRegister.email = genetic_analyst.info.email;
  geneticAnalystRegister.phone_number = genetic_analyst.info.phoneNumber;
  geneticAnalystRegister.profile_link = genetic_analyst.info.profileLink;
  geneticAnalystRegister.genetic_analyst_name = `${genetic_analyst.info.firstName} ${genetic_analyst.info.lastName}`;
  geneticAnalystRegister.gender = genetic_analyst.info.gender;
  geneticAnalystRegister.profile_image = genetic_analyst.info.profileImage;
  geneticAnalystRegister.certifications =
    await getGeneticAnalystRegisterCertifications(api, genetic_analyst.accountId);
  geneticAnalystRegister.services = await getGeneticAnalystRegisterServices(
    api,
    genetic_analyst.services,
  );

  return geneticAnalystRegister;
}

export * from './service';
export * from './certification';
