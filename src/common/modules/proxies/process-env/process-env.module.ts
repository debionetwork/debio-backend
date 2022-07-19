import { DynamicModule, Module } from '@nestjs/common';
import { ProcessEnvProxy } from './process-env.proxy';

@Module({
  providers: [ProcessEnvProxy],
  exports: [ProcessEnvModule, ProcessEnvProxy],
})
export class ProcessEnvModule {
  static async setDefault(env: Record<string, any>): Promise<DynamicModule> {
    for (let key in Object.keys(env)) {
      process.env[key] = process.env[key] ?? Object.values(env)[key];
    }
    return {
      module: ProcessEnvModule,
      providers: [ProcessEnvProxy],
      exports: [ProcessEnvModule, ProcessEnvProxy],
    };
  }
}
