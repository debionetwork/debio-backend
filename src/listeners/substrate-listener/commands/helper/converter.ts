import { Order, ServiceRequest } from "../../../../common";

export function humanToOrderListenerData(order: Order){
  order.additional_prices[0].value = Number(
    order.additional_prices[0].value
      .toString()
      .split(',')
      .join('')
  ) / 10 ** 18;

  order.prices[0].value = Number(
    order.prices[0].value
      .toString()
      .split(',')
      .join('')
  ) / 10 ** 18;

  order.created_at = new Date(
    Number(
      order.created_at
        .toString()
        .split(',')
        .join('')
    )
  )

  if (order.updated_at) {
    order.updated_at = new Date(
      Number(
        order.updated_at
          .toString()
          .split(',')
          .join('')
      )
    ) 
  }  

  return order
}

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