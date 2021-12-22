import { Module } from "@nestjs/common";
import { CacheRedisService } from "./cache-redis.service";

@Module({
	providers: [CacheRedisService],
	exports: [CacheRedisService,]
})
export class CacheRedisModule {}