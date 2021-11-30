import { Module } from "@nestjs/common";
import { ProcessEnvProxy } from "./process-env.proxy";

@Module({
  providers: [ProcessEnvProxy],
  exports: [ProcessEnvModule, ProcessEnvProxy],
})
export class ProcessEnvModule {}
