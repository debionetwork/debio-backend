import { Test, TestingModule } from '@nestjs/testing';
import { GCloudStorageService } from '@aginix/nestjs-gcloud-storage';
import { File, Bucket } from '@google-cloud/storage';
import { CloudStorageController } from '../../../src/cloud-storage/cloud-storage.controller';
import { MockType } from '../mock';
import { when } from 'jest-when';
import { DateTimeProxy } from '../../../src/common/date-time/date-time.proxy';

describe('Cloud Storage Controller Unit Tests', () => {
  const dateTimeProxyMockFactory: () => MockType<DateTimeProxy> = jest.fn(() => ({
    now: jest.fn(entity => entity),
    nowAndAdd: jest.fn(entity => entity)
  }));

  const fileMockFactory: () => MockType<File> = jest.fn(() => ({
    getSignedUrl: jest.fn(entity => entity)
  }));
  const fileMock = fileMockFactory();

  const bucketMockFactory: () => MockType<Bucket> = jest.fn(() => ({
      file: jest.fn(entity => entity)
  }));
  class GCloudStorageServiceMock {
    bucket = bucketMockFactory();
  }

  let dateTimeProxyMock: MockType<DateTimeProxy>;
  let cloudStorageServiceMock: GCloudStorageServiceMock;
  let cloudStorageController: CloudStorageController;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CloudStorageController,
        {
            provide: GCloudStorageService,
            useClass: GCloudStorageServiceMock
        },
        {
            provide: DateTimeProxy,
            useFactory: dateTimeProxyMockFactory
        }
      ],
    }).compile();
    dateTimeProxyMock = module.get(DateTimeProxy);
    cloudStorageServiceMock = module.get(GCloudStorageService);
    cloudStorageController = module.get(CloudStorageController);
  });

  it('should be defined', () => {
    // Assert
    expect(cloudStorageController).toBeDefined();
  });

  it('should get READ signed url', () => {
    // Arrange
    const EXPIRES = 0;
    const READ = "read";
    const FILENAME = "filename";
    const READ_SIGNED_URL = "readurl";
    const READ_CONDITIONS = {
        version: 'v4',
        action: READ,
        expires: EXPIRES,
        contentType: 'application/x-www-form-urlencoded',
    };

    dateTimeProxyMock.nowAndAdd.mockReturnValue(EXPIRES);
    when(fileMock.getSignedUrl).calledWith(READ_CONDITIONS).mockReturnValue(READ_SIGNED_URL);
    cloudStorageServiceMock.bucket.file.mockReturnValue(fileMock);

    // Assert
    expect(cloudStorageController.GetSignedUrl(FILENAME, READ)).resolves.toEqual({
        signedUrl: READ_SIGNED_URL
    });
    expect(dateTimeProxyMock.nowAndAdd).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalledWith(FILENAME);
    expect(fileMock.getSignedUrl).toHaveBeenCalledWith(READ_CONDITIONS);
  });

  it('should get WRITE signed url', () => {
    // Arrange
    const EXPIRES = 0;
    const WRITE = "write";
    const FILENAME = "filename";
    const WRITE_SIGNED_URL = "writeurl";
    const WRITE_CONDITIONS = {
        version: 'v4',
        action: WRITE,
        expires: EXPIRES,
        contentType: 'application/x-www-form-urlencoded',
    }

    dateTimeProxyMock.nowAndAdd.mockReturnValue(EXPIRES);
    when(fileMock.getSignedUrl).calledWith(WRITE_CONDITIONS).mockReturnValue(WRITE_SIGNED_URL);
    cloudStorageServiceMock.bucket.file.mockReturnValue(fileMock);

    // Assert
    expect(cloudStorageController.GetSignedUrl(FILENAME, WRITE)).resolves.toEqual({
        signedUrl: WRITE_SIGNED_URL
    });
    expect(dateTimeProxyMock.nowAndAdd).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalledWith(FILENAME);
    expect(fileMock.getSignedUrl).toHaveBeenCalledWith(WRITE_CONDITIONS);
  });
});
