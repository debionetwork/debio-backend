import { ApiPromise } from '@polkadot/api';
import { queryCertificationsByMultipleIds } from '@debionetwork/polkadot-provider';

export class LabRegisterCertification {
  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string;
}

export async function getLabRegisterCertification(
  api: ApiPromise,
  ids: string[],
): Promise<Array<LabRegisterCertification>> {
  const certifications = await queryCertificationsByMultipleIds(api as any, ids);
  const labRegisterCertifications: Array<LabRegisterCertification> =
    new Array<LabRegisterCertification>();

  certifications.forEach((val) => {
    const lrc: LabRegisterCertification = new LabRegisterCertification();
    lrc.title = val.info.title;
    lrc.issuer = val.info.issuer;
    lrc.description = val.info.description;
    lrc.month = val.info.month;
    lrc.year = val.info.year;
    lrc.supporting_document = val.info.supportingDocument;
    labRegisterCertifications.push(lrc);
  });

  return labRegisterCertifications;
}
