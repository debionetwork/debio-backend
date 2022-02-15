import { Order, ServiceRequest } from "../../../../common";

export function humanToServiceRequestListenerData(serviceRequest: ServiceRequest) {  
  serviceRequest.staking_amount = Number(
    serviceRequest.staking_amount
      .toString()
      .split(',')
      .join('')
    ) / 10 ** 18;

  serviceRequest.created_at = new Date(
    Number(
      serviceRequest.created_at
        .toString()
        .split(',')
        .join('')
    )
  )

  if (serviceRequest.unstaked_at) {  
    serviceRequest.unstaked_at = new Date(
      Number(
        serviceRequest.unstaked_at
          .toString()
          .split(',')
          .join('')
      )
    )
  }

  if (serviceRequest.updated_at) {
    serviceRequest.updated_at = new Date(
      Number(
        serviceRequest.updated_at
          .toString()
          .split(',')
          .join('')
      )
    )
  }

  return serviceRequest
}