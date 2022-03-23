import { mockFunction } from './mock';

export class WsProvider {
  constructor(params) {
    mockFunction(params);
  }
}
export class ApiPromise {
  // eslint-disable-next-line
  static create(provider) {
    return new ApiPromise();
  }
  // eslint-disable-next-line
  on(ev, func) {
    mockFunction(ev);
  }
}
export class Keyring {
  constructor(params) {
    mockFunction(params);
  }
  addFromUri(provider) {} // eslint-disable-line
}
