import { ApiPromise } from "@polkadot/api";

export async function createOrder(api: ApiPromise, pair: any, serviceId: string, customerBoxPublicKey: string, priceIndex: number): Promise<void> {
    await api.tx.orders
        .createOrder(serviceId, priceIndex, customerBoxPublicKey)
        .signAndSend(pair, { nonce: -1 })
}

export async function fulfillOrder(api: ApiPromise, pair: any, orderId: string, callback: Function = ()=>{}): Promise<void> { // eslint-disable-line
    const unsub = await api.tx.orders
        .fulfillOrder(orderId)
        .signAndSend(pair, { nonce: -1 }, ({ events, status }) => 
            successCallback(api, { events, status, callback, unsub })
        )
}

export async function refundOrder(api: ApiPromise, pair: any, orderId): Promise<void> {
    await api.tx.orders
        .refundOrder(orderId)
        .signAndSend(pair, { nonce: -1 })
}

export async function setOrderPaid(api: ApiPromise, pair: any, orderId): Promise<void> {
    await api.tx.orders
        .setOrderPaid(orderId)
        .signAndSend(pair, { nonce: -1 })
}

export async function cancelOrder(api: ApiPromise, pair: any, orderId): Promise<void> {
    await api.tx.orders
        .cancelOrder(orderId)
        .signAndSend(pair, { nonce: -1 })
}

function successCallback(api: ApiPromise, { events, status, callback, unsub }){
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