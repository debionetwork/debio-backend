import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CacheRedisController } from "./cache-redis.controller";
import { CacheRedisService } from "./cache-redis.service";

@Module({
	imports: [HttpModule.register({
		timeout: 5000,
		maxRedirects:5
	})],
	controllers: [CacheRedisController],
	providers: [CacheRedisService],
	exports: [CacheRedisService]
})
export class CacheRedisModule {}