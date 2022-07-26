import { ApiPromise } from '@polkadot/api';
import { queryCertificationsByMultipleIds } from '@debionetwork/polkadot-provider';

export class GeneticAnalystRegisterCertification {
  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string | undefined;
}

export async function getGeneticAnalystRegisterCertification(
  api: ApiPromise,
  ids: string[],
): Promise<Array<GeneticAnalystRegisterCertification>> {
  const certifications = await queryCertificationsByMultipleIds(
    api as any,
    ids,
  );
  const geneticAnalystRegisterCertifications: Array<GeneticAnalystRegisterCertification> =
    new Array<GeneticAnalystRegisterCertification>();

  certifications.forEach((val) => {
    const lrc: GeneticAnalystRegisterCertification =
      new GeneticAnalystRegisterCertification();
    lrc.title = val.info.title;
    lrc.issuer = val.info.issuer;
    lrc.description = val.info.description;
    lrc.month = val.info.month;
    lrc.year = val.info.year;
    lrc.supporting_document = val.info.supportingDocument;
    geneticAnalystRegisterCertifications.push(lrc);
  });

  return geneticAnalystRegisterCertifications;
}
