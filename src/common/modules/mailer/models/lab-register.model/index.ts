import { ApiPromise } from '@polkadot/api';
import { Lab } from '@debionetwork/polkadot-provider';
import {
  getLabRegisterCertification,
  LabRegisterCertification,
} from './certification';
import { getLabRegisterService, LabRegisterService } from './service';

export class LabRegister {
  lab_id: string;
  email: string;
  phone_number: string;
  website: string;
  lab_name: string;
  country: string;
  state: string;
  city: string;
  profile_image: string;
  address: string;
  certifications: Array<LabRegisterCertification>;
  services: Array<LabRegisterService>;
}

export async function labToLabRegister(
  api: ApiPromise,
  lab: Lab,
): Promise<LabRegister> {
  const labRegister = new LabRegister();

  labRegister.lab_id = lab.accountId;
  labRegister.email = lab.info.email;
  labRegister.phone_number = lab.info.phoneNumber;
  labRegister.website = lab.info.website;
  labRegister.lab_name = lab.info.name;
  labRegister.country = lab.info.country;
  labRegister.state = lab.info.region;
  labRegister.city = lab.info.city;
  labRegister.address = lab.info.address;
  labRegister.profile_image = lab.info.profileImage;
  labRegister.certifications = await getLabRegisterCertification(
    api,
    lab.certifications,
  );
  labRegister.services = await getLabRegisterService(api, lab.services);

  return labRegister;
}

export * from './service';
export * from './certification';
