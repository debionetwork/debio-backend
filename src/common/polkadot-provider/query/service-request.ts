import { ApiPromise } from '@polkadot/api';
import { ServiceRequest } from '..';

export async function queryServiceRequestById(api: ApiPromise, requestId: string): Promise<ServiceRequest> {
    const resp = (await api.query.serviceRequest.requestById(requestId)).toHuman();
    return new ServiceRequest(resp);
}