import { Injectable } from '@nestjs/common';
import { keyList } from '../../common/secrets';
import axios from 'axios';
import { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { config } from 'src/config';

@Injectable()
export class PinataService {
  constructor() {}
  async uploadToPinata(file: Express.Multer.File) {
    const options = {
      pinataMetadata: {
        name: file.filename,
        keyvalues: {
          required: '',
          type: file.mimetype,
          fileSize: file.size,
          date: +new Date(),
        },
      },
      pinataOptions: { cidVersion: 0 },
    };

    const data = new FormData();
    data.append('file', file);

    data.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
    data.append('pinataOptions', JSON.stringify(options.pinataOptions));

    const configuration: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      headers: {
        Authorization: config.PINATA_JWT.toString(),
        ...data.getHeaders(),
      },
      data: data,
    };

    const res = await axios(configuration);

    return res;
  }
}
