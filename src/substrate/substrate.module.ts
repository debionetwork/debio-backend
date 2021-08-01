import { Module } from "@nestjs/common";
import { SubstrateService } from "./substrate.service";

@Module({
  imports: [],
  providers: [SubstrateService],
  exports: [SubstrateService],
})
export class SubstrateModule {}