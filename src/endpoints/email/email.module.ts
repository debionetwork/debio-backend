import { Module } from "@nestjs/common";
import { MailModule } from "src/common";
import { EmailEndpointController } from "./email.controller";

@Module({
  imports: [MailModule],
  controllers: [EmailEndpointController],
})
export class EmailEndpointModule {}