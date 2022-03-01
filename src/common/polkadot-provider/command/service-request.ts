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

export async function finalizeRequest(
  api: ApiPromise,
  pair: any,
  requestId: string,
  isResultSuccess: string,
): Promise<void> {
  await api.tx.serviceRequest
    .finalizeRequest(requestId, isResultSuccess)
    .signAndSend(pair, { nonce: -1 });
}
