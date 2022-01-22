import { mockFunction } from "./mock";

export class WsProvider {
    constructor(params){
        mockFunction(params);
    }
};
export class ApiPromise {
    static create(provider) { // eslint-disable-line
        return new ApiPromise();
    }
    on(ev, func) { // eslint-disable-line
        mockFunction(ev);
    }
};
export class Keyring {
    constructor(params){
        mockFunction(params);
    }
    addFromUri(provider) {} // eslint-disable-line
}