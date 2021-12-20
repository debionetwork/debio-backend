import { DateTimeProxy } from "src/common/date-time/date-time.proxy";
import { Repository } from "typeorm";
import { File, Bucket } from '@google-cloud/storage';

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>;
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
const fileMock = fileMockFactory();

export const bucketMockFactory: () => MockType<Bucket> = jest.fn(() => ({
    file: jest.fn(entity => entity)
}));
export class GCloudStorageServiceMock {
  bucket = bucketMockFactory();
}