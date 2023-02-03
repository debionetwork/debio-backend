import { ApiPromise } from '@polkadot/api';
import {
  CertificationHP,
  ExperienceHP,
  queryHealthProfessionalQualificationById,
} from '@common/modules/polkadot-provider/query/health-professional';
import { HealthProfessional } from '@debionetwork/polkadot-provider/lib/models/health-professional';

export class HealthProfessionalRegister {
  health_professional_id: string;
  health_professional_name: string;
  email: string;
  phone_number: string;
  profile_link: string;
  profile_image: string | undefined;
  gender: string;
  category: string;
  experiences: Array<ExperienceHP>;
  certifications: Array<CertificationHP>;
  role: string;
}

export async function healthProfessionalToHPRegister(
  api: ApiPromise,
  health_professional: HealthProfessional,
): Promise<HealthProfessionalRegister> {
  const healthProfessionalRegister = new HealthProfessionalRegister();

  healthProfessionalRegister.certifications = [];
  healthProfessionalRegister.experiences = [];
  healthProfessionalRegister.email = health_professional.info.email;
  healthProfessionalRegister.phone_number =
    health_professional.info.phoneNumber;
  healthProfessionalRegister.profile_link =
    health_professional.info.profileLink;
  healthProfessionalRegister.health_professional_name = `${health_professional.info.firstName} ${health_professional.info.lastName}`;
  healthProfessionalRegister.gender = health_professional.info.gender;
  healthProfessionalRegister.profile_image =
    health_professional.info.profileImage;
  healthProfessionalRegister.category = health_professional.info.category;
  healthProfessionalRegister.role = health_professional.info.role;

  for (let i = 0; i < health_professional.qualifications.length; i++) {
    const hashId = health_professional.qualifications[i];
    const qualification = await queryHealthProfessionalQualificationById(
      api,
      hashId,
    );
    healthProfessionalRegister.certifications.push(
      ...qualification.info.certifications,
    );
    healthProfessionalRegister.experiences.push(
      ...qualification.info.experiences,
    );
  }

  return healthProfessionalRegister;
}
