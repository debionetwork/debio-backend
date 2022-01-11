export * from "./service-created/service-created.command";

import { ServiceCreatedHandler } from "./service-created/service-created.handler";

export const ServiceCommandHandlers = [
  ServiceCreatedHandler,
];
