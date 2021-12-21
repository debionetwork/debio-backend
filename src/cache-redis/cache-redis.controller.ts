import { Controller, Get } from "@nestjs/common";
import { CacheRedisService } from "./cache-redis.service";

@Controller('balance')
export class CacheRedisController {
    constructor(private readonly service: CacheRedisService) {}

    @Get()
    getAll(){
        return this.service.getExchange()
    }
}