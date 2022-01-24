import { Test, TestingModule } from '@nestjs/testing';
import { GCloudStorageService } from '@aginix/nestjs-gcloud-storage';
import { CloudStorageController } from '../../../../src/endpoints/cloud-storage/cloud-storage.controller';
import {
  dateTimeProxyMockFactory,
  fileMockFactory,
  GCloudStorageServiceMock,
  MockType,
} from '../../mock';
import { when } from 'jest-when';
import { DateTimeProxy } from '../../../../src/common';

describe('Cloud Storage Controller Unit Tests', () => {
  const fileMock = fileMockFactory();

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
          useClass: GCloudStorageServiceMock,
        },
        {
          provide: DateTimeProxy,
          useFactory: dateTimeProxyMockFactory,
        },
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
    const READ = 'read';
    const FILENAME = 'filename';
    const READ_SIGNED_URL = ['readurl'];
    const READ_CONDITIONS = {
      action: READ,
      expires: EXPIRES,
      version: 'v4',
    };

    dateTimeProxyMock.nowAndAdd.mockReturnValue(EXPIRES);
    when(fileMock.getSignedUrl)
      .calledWith(READ_CONDITIONS)
      .mockReturnValue(READ_SIGNED_URL);
    cloudStorageServiceMock.bucket.file.mockReturnValue(fileMock);

    // Assert
    expect(
      cloudStorageController.GetSignedUrl(FILENAME, READ),
    ).resolves.toEqual({
      signedUrl: READ_SIGNED_URL[0],
    });
    expect(dateTimeProxyMock.nowAndAdd).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalledWith(FILENAME);
    expect(fileMock.getSignedUrl).toHaveBeenCalledWith(READ_CONDITIONS);
  });

  it('should get WRITE signed url', () => {
    // Arrange
    const EXPIRES = 0;
    const WRITE = 'write';
    const FILENAME = 'filename';
    const WRITE_SIGNED_URL = ['writeurl'];
    const WRITE_CONDITIONS = {
      action: WRITE,
      contentType: 'application/x-www-form-urlencoded',
      expires: EXPIRES,
      version: 'v4',
    };

    dateTimeProxyMock.nowAndAdd.mockReturnValue(EXPIRES);
    when(fileMock.getSignedUrl)
      .calledWith(WRITE_CONDITIONS)
      .mockReturnValue(WRITE_SIGNED_URL);
    cloudStorageServiceMock.bucket.file.mockReturnValue(fileMock);

    // Assert
    expect(
      cloudStorageController.GetSignedUrl(FILENAME, WRITE),
    ).resolves.toEqual({
      signedUrl: WRITE_SIGNED_URL[0],
    });
    expect(dateTimeProxyMock.nowAndAdd).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalled();
    expect(cloudStorageServiceMock.bucket.file).toHaveBeenCalledWith(FILENAME);
    expect(fileMock.getSignedUrl).toHaveBeenCalledWith(WRITE_CONDITIONS);
  });
});
