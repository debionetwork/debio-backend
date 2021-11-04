import { ApiPromise } from "@polkadot/api"
import { Certification } from "../../models/certifications";

export async function queryCertificationById(api: ApiPromise, certificationId: string): Promise<Certification>{
  const res = (await api.query.certifications.certifications(certificationId)).toHuman();
  return new Certification(res);
}

export async function queryCertificationsByMultipleIds(api: ApiPromise, certificationIds: string[]): Promise<Array<Certification>>{
  const certifications: Array<Certification> = new Array<Certification>();
  for (const id in certificationIds) {
    certifications.push(await queryCertificationById(api, id));
  }
  return certifications;
}
