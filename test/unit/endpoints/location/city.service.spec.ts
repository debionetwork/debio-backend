import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityService } from '../../../../src/endpoints/location/city.service';
import { City } from '../../../../src/endpoints/location/models/city.entity';
import { MockType, repositoryMockFactory } from '../../mock';
import { Repository } from 'typeorm';

describe('City Service Unit Tests', () => {
  let cityService: CityService;
  let repositoryMock: MockType<Repository<City>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(City, 'dbLocation'),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    cityService = module.get(CityService);
    repositoryMock = module.get(getRepositoryToken(City, 'dbLocation'));
  });

  it('should be defined', () => {
    // Assert
    expect(cityService).toBeDefined();
  });

  it('should find all cities', () => {
    // Arrange
    const COUNTRY_CODE = 'CODE';
    const STATE_CODE = 'CODE';
    const RESULTS = [
      {
        city: 'City 1',
      },
      {
        city: 'City 2',
      },
    ];
    const PARAM = {
      where: {
        country_code: COUNTRY_CODE,
        state_code: STATE_CODE,
      },
      order: {
        name: 'ASC',
      },
    };
    repositoryMock.find.mockReturnValue(RESULTS);

    // Assert
    expect(cityService.getAllCity(COUNTRY_CODE, STATE_CODE)).toEqual(RESULTS);
    expect(repositoryMock.find).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.find).toHaveBeenCalled();
  });

  it('should find one city', () => {
    // Arrange
    const ID = 0;
    const RESULTS = [
      {
        city: 'City 1',
      },
      {
        city: 'City 2',
      },
    ];
    repositoryMock.findOneOrFail.mockReturnValue(RESULTS);

    // Assert
    expect(cityService.getOneCity(ID)).toEqual(RESULTS);
    expect(repositoryMock.findOneOrFail).toHaveBeenCalledWith(ID);
    expect(repositoryMock.findOneOrFail).toHaveBeenCalled();
  });
});
