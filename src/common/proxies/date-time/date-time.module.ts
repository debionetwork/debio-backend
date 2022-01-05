import { Module } from "@nestjs/common";
import { DateTimeProxy } from "./date-time.proxy";

@Module({
  providers: [DateTimeProxy],
  exports: [DateTimeModule, DateTimeProxy],
})
export class DateTimeModule {}
