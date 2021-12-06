import { ApiPromise } from '@polkadot/api';
import { Service } from '../models/services';

export async function queryServiceById(
  api: ApiPromise,
  serviceId: string,
): Promise<Service> {
  console.log('service one', serviceId);
  
  const res = (await api.query.services.services(serviceId)).toHuman();
  console.log('res', res);
  
  return new Service(res);
}

export async function queryServicesByMultipleIds(
  api: ApiPromise,
  serviceIds: string[],
): Promise<Array<Service>> {
  const services: Array<Service> = new Array<Service>();
  for (const id in serviceIds) {
    services.push(await queryServiceById(api, id));
  }
  return services;
}

export async function queryServicesByMultipleIdsArray(
  api: ApiPromise,
  serviceIds: string[],
): Promise<Array<Service>> {
  const services: Array<Service> = new Array<Service>();
  for (const id in serviceIds) {
    console.log(await queryServiceById(api, serviceIds[id]));
  }
  return services;
}

export async function queryServicesCount(api: ApiPromise): Promise<number> {
  const res: any = (await api.query.services.servicesCount()).toHuman();
  return parseInt(res);
}

export async function queryServicesCountByOwnerId(
  api: ApiPromise,
  accoutId: string,
): Promise<number> {
  const res: any = (
    await api.query.services.servicesCountByOwner(accoutId)
  ).toHuman();
  return parseInt(res);
}
