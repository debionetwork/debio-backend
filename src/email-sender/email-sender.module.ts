import { EmailNotificationModule, MailModule, SubstrateModule } from "@common/modules";
import { keyList } from "@common/secrets";
import { GCloudSecretManagerService } from "@debionetwork/nestjs-gcloud-secret-manager";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (gCloudSecretManagerService: GCloudSecretManagerService<keyList>,) => {
        return {
          redis: {
            host: gCloudSecretManagerService.getSecret('REDIS_HOST').toString(),
            port: Number(gCloudSecretManagerService.getSecret('REDIS_PORT').toString()),
          }
        };
      }
    }),
    BullModule.registerQueueAsync({
      name: 'email-sender-queue'
    }),
    MailModule, EmailNotificationModule
  ]
})
export class EmailSenderModule{}