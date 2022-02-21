import { CertificationInfo } from './certification-info';

export class Certification {
  constructor(anyJson: any) {
    this.id = anyJson.id;
    this.owner_id = anyJson.owneIid;
    this.info = anyJson.info;
  }
  id: string;
  owner_id: string;
  info: CertificationInfo;
}

export * from './certification-info';
