import { ApiPromise } from '@polkadot/api';
import { queryGeneticAnalystByAccountId } from '@debionetwork/polkadot-provider';
import { GeneticAnalystQualificationCertification } from '@debionetwork/polkadot-provider/lib/models/genetic-analysts/genetic-analyst-qualification/genetic-analyst-qualification-certification';

export class GeneticAnalystRegisterCertification {
  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string | undefined;
}

export async function getGeneticAnalystRegisterCertifications(
  api: ApiPromise,
  geneticAnalystId: string,
): Promise<Array<GeneticAnalystQualificationCertification>> {
  const certifications = await queryGeneticAnalystByAccountId(
    api as any,
    geneticAnalystId,
  );
  console.log("certification", certifications);
  
  const geneticAnalystRegisterCertifications: Array<GeneticAnalystQualificationCertification> =
    new Array<GeneticAnalystQualificationCertification>();

  // certifications.forEach((val) => {
  //   const lrc: GeneticAnalystQualificationCertification =
  //     new GeneticAnalystQualificationCertification();
  //   lrc.title = val.info.title;
  //   lrc.issuer = val.info.issuer;
  //   lrc.description = val.info.description;
  //   lrc.month = val.info.month;
  //   lrc.year = val.info.year;
  //   lrc.supporting_document = val.info.supportingDocument;
  //   geneticAnalystQualificationCertifications.push(lrc);
  // });

  return geneticAnalystRegisterCertifications;
}
