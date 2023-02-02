import { HealthProfessional } from '@debionetwork/polkadot-provider/lib/models/health-professional/';
import { ApiPromise } from '@polkadot/api';

export class ExperienceHP {
  constructor(data: any) {
    this.title = data.title;
  }
  title: string;
}

export class CertificationHP {
  constructor(data: any) {
    this.title = data.title;
    this.issuer = data.issuer;
    this.month = data.month;
    this.year = data.year;
    this.description = data.description;
    this.supporting_document = data.supportingDocument;
  }
  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string;
}

export class InfoHP {
  constructor(data: any) {
    this.experiences = data.experiences;
    this.certifications = data.certifications;
  }
  experiences: ExperienceHP[];
  certifications: CertificationHP[];
}

export class QualificationHP {
  constructor(data: any) {
    this.id = data.id;
    this.owner = data.owner;
    this.info = data.info;
  }
  id: string;
  owner: string;
  info: InfoHP;
}

export const queryHealthProfessionalById = async (
  api: ApiPromise,
  id: string,
): Promise<HealthProfessional> => {
  const res = (
    await api.query.healthProfessional.healthProfessionals(id)
  ).toHuman();
  return new HealthProfessional(res);
};

export const queryHealthProfessionalQualificationById = async (
  api: ApiPromise,
  id: string,
): Promise<QualificationHP> => {
  const res = (
    await api.query.healthProfessionalQualification.healthProfessionalQualifications(
      id,
    )
  ).toHuman();
  return new QualificationHP(res);
};
