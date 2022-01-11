import { ApiPromise } from "@polkadot/api";
import { LabInfo, LabVerificationStatus } from "..";

export async function registerLab(api: ApiPromise, pair: any, data: LabInfo, callback: Function = () => {}){ // eslint-disable-line
    const unsub = await api.tx.labs
        .registerLab(data)
        .signAndSend(pair, { nonce: -1 }, async ({ events = [], status }) => {
            successCallback(api, pair, { events, status, callback, unsub })
        })
}

export async function updateLab(api: ApiPromise, pair: any, data: LabInfo, callback: Function = () => {}){ // eslint-disable-line
    const unsub = await api.tx.labs
        .updateLab(data)
        .signAndSend(pair, { nonce: -1 }, async ({ events = [], status }) => {
            successCallback(api, pair, { events, status, callback, unsub })
        })
}

export async function updateLabVerificationStatus(api: ApiPromise, pair: any, substrateAddress: string, labVerificationStatus: LabVerificationStatus, callback: Function = () => {}){ // eslint-disable-line
    const unsub = await api.tx.labs
        .updateLabVerificationStatus(substrateAddress, labVerificationStatus.toString())
        .signAndSend(pair, { nonce: -1 }, async ({ events = [], status }) => {
            successCallback(api, pair, { events, status, callback, unsub })
        })
}

export async function deregisterLab(api: ApiPromise, pair: any){
    const result = await api.tx.labs
        .deregisterLab()
        .signAndSend(pair, { nonce: -1 })
    return result.toHuman()
}

export async function successCallback(api: ApiPromise, pair: any, { events, status, callback, unsub }){
    if (status.isFinalized) {
        // find/filter for success events
        const eventList = events.filter(({ event }) =>
            api.events.system.ExtrinsicSuccess.is(event)
        )
        if(eventList.length > 0){
            callback()
            unsub()
        }
    }
}