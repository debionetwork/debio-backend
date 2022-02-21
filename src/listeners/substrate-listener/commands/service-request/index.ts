export * from './service-request-created/service-request-created.command';
export * from './service-request-processed/service-request-processed.command';
export * from './service-request-unstaked/service-request-unstaked.command';
export * from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.command';

import { ServiceRequestCreatedHandler } from './service-request-created/service-request-created.handler';
import { ServiceRequestProcessedHandler } from './service-request-processed/service-request-processed.handler';
import { ServiceRequestUnstakedHandler } from './service-request-unstaked/service-request-unstaked.handler';
import { ServiceRequestWaitingForUnstakedHandler } from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler';

export const ServiceRequestCommandHandlers = [
  ServiceRequestCreatedHandler,
  ServiceRequestProcessedHandler,
  ServiceRequestUnstakedHandler,
  ServiceRequestWaitingForUnstakedHandler,
];
