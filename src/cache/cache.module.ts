import { CacheInterceptor, CacheModule, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

@Module({
  imports: [CacheModule.register()],
  controllers: [],
  providers: [
    {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor,
    }
  ]
})

export class CachingModule {}