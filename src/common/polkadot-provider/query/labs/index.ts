import { ApiPromise } from '@polkadot/api';
import { Lab } from '../../models/labs';

export async function queryLabById(
  api: ApiPromise,
  labId: string,
): Promise<Lab> {
  const res = (await api.query.labs.labs(labId)).toHuman();
  return new Lab(res);
}

export * from './certifications';
