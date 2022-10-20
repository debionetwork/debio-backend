import { Injectable } from "@nestjs/common";
import { uploadFile } from "@debionetwork/pinata-ipfs";
import { GCloudSecretManagerService } from "@debionetwork/nestjs-gcloud-secret-manager";
import { keyList } from "../../common/secrets";

@Injectable()
export class PinataService {
  constructor(
    private readonly gCloudSecretManagerService: GCloudSecretManagerService<keyList>,
  ) 
  {}
  async uploadToPinata(file: Express.Multer.File) {
    const options = {
      pinataMetadata: {
        name: file.filename,
        keyvalues: {
          required: "",
          type: file.mimetype,
          fileSize: file.size,
          date: +new Date()
        }
      },
      pinataOptions: { cidVersion: 0 }
    }
    await uploadFile(
      options,
      file.buffer,
      this.gCloudSecretManagerService.getSecret("VUE_APP_PINATA_JWT_KEY").toString(),
    )
  }
}