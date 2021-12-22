import { DateTimeProxy } from "src/common/date-time/date-time.proxy";
import { Repository } from "typeorm";
import { File, Bucket } from '@google-cloud/storage';
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { MailerService } from "@nestjs-modules/mailer";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>; // eslint-disable-line
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    find: jest.fn(entity => entity),
    findOne: jest.fn(entity => entity),
    save: jest.fn(entity => entity),
}));

export const dateTimeProxyMockFactory: () => MockType<DateTimeProxy> = jest.fn(() => ({
  now: jest.fn(entity => entity),
  nowAndAdd: jest.fn(entity => entity)
}));


export const fileMockFactory: () => MockType<File> = jest.fn(() => ({
  getSignedUrl: jest.fn(entity => entity)
}));

export const bucketMockFactory: () => MockType<Bucket> = jest.fn(() => ({
    file: jest.fn(entity => entity)
}));
export class GCloudStorageServiceMock {
  bucket = bucketMockFactory();
}

export const elasticsearchServiceMockFactory: () => MockType<ElasticsearchService> = jest.fn(() => ({
  delete: jest.fn(entity => entity),
  deleteByQuery: jest.fn(entity => entity),
  index: jest.fn(entity => entity),
  update: jest.fn(entity => entity),
  updateByQuery: jest.fn(entity => entity),
  search: jest.fn(entity => entity),
}));

export const mailerServiceMockFactory: () => MockType<MailerService> = jest.fn(() => ({
  sendMail: jest.fn(entity => entity),
}));