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
  callback = () => {}
) {
  const unsub = await api.tx.serviceRequest
    .finalizeRequest(requestId, isResultSuccess)
    .signAndSend(pair, { nonce: -1 }, async ({ events = [], status }) => {
      if(status.isFinalized) {
        const eventList = events.filter(({ event }) =>
          api.events.system.ExtrinsicSuccess.is(event)
        )
        if(eventList.length > 0){
          callback()
          unsub()
        }
      }
    });
}
