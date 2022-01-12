import { ApiPromise } from '@polkadot/api';
import { ServiceInvoice, ServiceRequest } from '..';

export async function queryServiceRequestById(
  api: ApiPromise,
  requestId: string,
): Promise<ServiceRequest> {
  const resp = (
    await api?.query?.serviceRequest.requestById(requestId)
  ).toHuman();
  return new ServiceRequest(resp);
}

export async function queryServiceInvoiceById(
  api: ApiPromise,
  serviceHash: string,
): Promise<ServiceInvoice> {
  const resp = (
    await api?.query?.serviceRequest.serviceInvoiceById(serviceHash)
  ).toHuman();
  return new ServiceInvoice(resp);
}

export async function queryServiceInvoiceByOrderId(
  api: ApiPromise,
  orderId: string,
): Promise<ServiceInvoice> {
  const resp = (
    await api?.query?.serviceRequest.serviceInvoiceByOrderId(orderId)
  ).toHuman();
  return new ServiceInvoice(resp);
}
