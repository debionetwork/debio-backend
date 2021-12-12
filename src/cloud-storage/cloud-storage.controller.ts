import { Controller, Get, Query } from "@nestjs/common";
import { GCloudStorageService } from "@aginix/nestjs-gcloud-storage";
import { DateTimeProxy } from "../common/date-time/date-time.proxy";

@Controller("gcs")
export class CloudStorageController {
  constructor(
    private readonly dateTime: DateTimeProxy,
    private readonly cloudStorageService: GCloudStorageService,
  ) {}

  @Get("/signed-url")
  async GetSignedUrl(
    @Query("filename") filename: string,
    @Query("action") action: "read" | "write",
  ) {
    const URL_VALID_DURATION = 100000;
    if (action === "read") {
      const [url] = await this.cloudStorageService
        .bucket
        .file(filename)
        .getSignedUrl({
          version: "v4",
          action: action,
          expires: this.dateTime.nowAndAdd(URL_VALID_DURATION),
        });

      return {
        signedUrl: url,
      };
    }

    const [url] = await this.cloudStorageService
      .bucket
      .file(filename)
      .getSignedUrl({
        version: "v4",
        action: action,
        expires: this.dateTime.nowAndAdd(URL_VALID_DURATION),
        contentType: "application/x-www-form-urlencoded",
      });

    return {
      signedUrl: url,
    };
  }
}
