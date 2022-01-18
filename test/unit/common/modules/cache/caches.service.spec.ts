import { Test, TestingModule } from "@nestjs/testing";
import { Cache as CacheManager } from "cache-manager";
import { CachesService } from "../../../../../src/common/modules/caches";
import { cacheMockFactory, MockType } from "../../../mock";
import { when } from 'jest-when';
import { CACHE_MANAGER } from "@nestjs/common";

describe('Caches Service Unit Test', () => {
  let cachesServiceMock: CachesService;
  let cacheManagerMock: MockType<CacheManager>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CachesService,
        { provide: CACHE_MANAGER, useFactory: cacheMockFactory },
      ],
    }).compile();

    cachesServiceMock = module.get(CachesService);
    cacheManagerMock = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    // Assert
    expect(cachesServiceMock).toBeDefined();
  });

  it('should get last block', () => {
    const PARAM = 'last-block';
    const RESULT = 1;

    when(cacheManagerMock.get).calledWith(PARAM).mockReturnValue(RESULT);

    expect(cachesServiceMock.getLastBlock()).resolves.toEqual(RESULT);
    expect(cacheManagerMock.get).toHaveBeenCalled();
    expect(cacheManagerMock.get).toHaveBeenCalledWith(PARAM);
  });

  it('should set last block', () => {
    const PARAM = 'last-block';
    const RESULT = 1;

    when(cacheManagerMock.set).calledWith(PARAM, RESULT).mockReturnValue(RESULT);

    expect(cachesServiceMock.setLastBlock(RESULT)).resolves.toEqual(RESULT);
    expect(cacheManagerMock.set).toHaveBeenCalled();
    expect(cacheManagerMock.set).toHaveBeenCalledWith(PARAM, RESULT);
  });
});