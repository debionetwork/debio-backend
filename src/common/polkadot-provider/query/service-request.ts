import { ApiPromise } from '@polkadot/api';
import { ServiceInvoice, ServiceRequest } from '..';

export const queryServiceRequestById = async (
  api: ApiPromise,
  requestId: string,
): Promise<ServiceRequest> => {
  const resp = (
    await api.query.serviceRequest.requestById(requestId)
  ).toHuman();
  return new ServiceRequest(resp);
}

export const queryServiceInvoiceById = async (
  api: ApiPromise,
  serviceHash: string,
): Promise<ServiceInvoice> => {
  const resp = (
    await api.query.serviceRequest.serviceInvoiceById(serviceHash)
  ).toHuman();
  return new ServiceInvoice(resp);
}

export const queryServiceInvoiceByOrderId = async (
  api: ApiPromise,
  orderId: string,
): Promise<ServiceInvoice> => {
  const resp = (
    await api.query.serviceRequest.serviceInvoiceByOrderId(orderId)
  ).toHuman();
  return new ServiceInvoice(resp);
}
