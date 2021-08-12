import { CacheInterceptor, Controller, UseInterceptors } from '@nestjs/common';

@Controller()
@UseInterceptors(CacheInterceptor)
export class CachingController {}
