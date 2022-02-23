import { ApiPromise } from '@polkadot/api';
import { GeneticAnalystsVerificationStatus } from '../models/genetic-analysts';

export async function updateGeneticAnalystVerificationStatus(
  api: ApiPromise,
  pair: any,
  accountId: string,
  geneticAnalystVerificationStatus: GeneticAnalystsVerificationStatus,
	callback: Function = () => {}){ // eslint-disable-line
  const unsub = await api.tx.geneticAnalysts
    .updateGeneticAnalystVerificationStatus(
      accountId,
      geneticAnalystVerificationStatus.toString(),
    )
    .signAndSend(pair, { nonce: -1 }, async ({ events = [], status }) => {
      isSuccessCallback(api, pair, { events, status, callback, unsub });
    });
}

export async function isSuccessCallback(
  api: ApiPromise,
  pair: any,
  { events, status, callback, unsub },
) {
  if (status.isFinalized) {
    // find/filter for success events
    const eventList = events.filter(({ event }) =>
      api.events.system.ExtrinsicSuccess.is(event),
    );
    if (eventList.length > 0) {
      callback();
      unsub();
    }
  }
}
