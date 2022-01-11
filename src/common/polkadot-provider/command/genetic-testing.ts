import { ApiPromise } from '@polkadot/api';
import { DnaTestResultSubmission } from '../models';

export async function processDnaSample(api: ApiPromise, pair: any, trackingId: string, process_status: any, callback: Function = ()=>{}) { // eslint-disable-line
  const unsub = await api.tx.geneticTesting
    .processDnaSample(trackingId, process_status)
    .signAndSend(pair, { nonce: -1 }, ({ events, status }) =>
      successCallback(api, { events, status, callback, unsub }),
    );
}

export async function receiveDnaSample(api: ApiPromise, pair: any, trackingId: string, callback: Function = ()=>{}) { // eslint-disable-line
  const unsub = await api.tx.geneticTesting
    .receiveDnaSample(trackingId)
    .signAndSend(pair, { nonce: -1 }, ({ events, status }) =>
      successCallback(api, { events, status, callback, unsub }),
    );
}

export async function rejectDnaSample(api: ApiPromise, pair: any, trackingId: string, rejectedTitle: string, rejectedDescription: string, callback: Function = ()=>{}) { // eslint-disable-line
  const unsub = await api.tx.geneticTesting
    .rejectDnaSample(trackingId, rejectedTitle, rejectedDescription)
    .signAndSend(pair, { nonce: -1 }, ({ events, status }) =>
      successCallback(api, { events, status, callback, unsub }),
    );
}

export async function submitIndependentTestResult(api: ApiPromise, pair: any, submission: DnaTestResultSubmission, callback: Function = ()=>{}) { // eslint-disable-line
  const unsub = await api.tx.geneticTesting
    .submitIndependentTestResult(submission)
    .signAndSend(pair, { nonce: -1 }, ({ events, status }) =>
      successCallback(api, { events, status, callback, unsub }),
    );
}

export async function submitTestResult(api: ApiPromise, pair: any, trackingId: string, submission: DnaTestResultSubmission, callback: Function = ()=>{}) { // eslint-disable-line
  const unsub = await api.tx.geneticTesting
    .submitTestResult(trackingId, submission)
    .signAndSend(pair, { nonce: -1 }, ({ events, status }) =>
      successCallback(api, { events, status, callback, unsub }),
    );
}

function successCallback(api: ApiPromise, { events, status, callback, unsub }) {
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
