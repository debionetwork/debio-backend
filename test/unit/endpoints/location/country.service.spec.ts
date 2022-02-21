import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CountryService } from '../../../../src/endpoints/location/country.service';
import { Country } from '../../../../src/endpoints/location/models/country.entity';
import { MockType, repositoryMockFactory } from '../../mock';
import { Repository } from 'typeorm';
import { when } from 'jest-when';

describe('Country Service Unit Tests', () => {
  let countryService: CountryService;
  let repositoryMock: MockType<Repository<Country>>;

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: getRepositoryToken(Country, 'dbLocation'),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();
    countryService = module.get(CountryService);
    repositoryMock = module.get(getRepositoryToken(Country, 'dbLocation'));
  });

  it('should be defined', () => {
    // Assert
    expect(countryService).toBeDefined();
  });

  it('should find all countries', () => {
    // Arrange
    const RESULTS = [
      {
        country: 'Country 1',
      },
      {
        country: 'Country 2',
      },
    ];
    const PARAM = {
      order: {
        name: 'ASC',
      },
    };
    when(repositoryMock.find).calledWith(PARAM).mockReturnValue(RESULTS);

    // Assert
    expect(countryService.getAll()).resolves.toEqual(RESULTS);
    expect(repositoryMock.find).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.find).toHaveBeenCalled();
  });

  it('should find one country', () => {
    // Arrange
    const ISO2 = 'ISO2';
    const RESULTS = [
      {
        country: 'Country 1',
      },
      {
        country: 'Country 2',
      },
    ];
    const PARAM = {
      where: { iso2: ISO2 },
    };
    when(repositoryMock.findOne).calledWith(PARAM).mockReturnValue(RESULTS);

    // Assert
    expect(countryService.getByIso2Code(ISO2)).resolves.toEqual(RESULTS);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(PARAM);
    expect(repositoryMock.findOne).toHaveBeenCalled();
  });
});
