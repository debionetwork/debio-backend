import { LabRegisterCertification } from './certification';
import { LabRegisterService } from './service';

export class LabRegister {
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

export * from './service';
export * from './certification';