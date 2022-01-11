import { ApiPromise } from '@polkadot/api';

export async function retrieveUnstakedAmount(
  api: ApiPromise,
  pair: any,
  requestId: string,
): Promise<void> {
  await api.tx.serviceRequest
    .retrieveUnstakedAmount(requestId)
    .signAndSend(pair, { nonce: -1 });
}
