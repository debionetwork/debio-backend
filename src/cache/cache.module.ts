import { CacheModule, Module } from "@nestjs/common";

@Module({
  imports: [CacheModule.register()]
  // controllers: []
})

export class CachingModule {}