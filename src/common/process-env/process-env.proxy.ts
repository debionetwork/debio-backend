import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcessEnvProxy {
    public readonly env: NodeJS.ProcessEnv;
    constructor() {
        this.env = process.env;
    }
}
