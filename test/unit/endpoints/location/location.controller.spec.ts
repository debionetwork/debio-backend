import { MockType } from '../../mock';
import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from '../../../../src/endpoints/location/country.service';
import { CityService } from '../../../../src/endpoints/location/city.service';
import { StateService } from '../../../../src/endpoints/location/state.service';
import { LocationController } from '../../../../src/endpoints/location/location.controller';

describe('Location Controller Unit Tests', () => {
  let locationController: MockType<LocationController>;
  let countryServiceMock: MockType<CountryService>;
  let stateServiceMock: MockType<StateService>;
  let cityServiceMock: MockType<CityService>;

  const countryServiceMockFactory: () => MockType<CountryService> = jest.fn(
    () => ({
      getAll: jest.fn(),
    }),
  );

  const stateServiceMockFactory: () => MockType<StateService> = jest.fn(() => ({
    getAllRegion: jest.fn(),
  }));

  const cityServiceMockFactory: () => MockType<CityService> = jest.fn(() => ({
    getAllCity: jest.fn(),
    getOneCity: jest.fn(),
  }));

  // Arrange before each iteration
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationController,
        { provide: CountryService, useFactory: countryServiceMockFactory },
        { provide: StateService, useFactory: stateServiceMockFactory },
        { provide: CityService, useFactory: cityServiceMockFactory },
      ],
    }).compile();

    locationController = module.get(LocationController);
    countryServiceMock = module.get(CountryService);
    stateServiceMock = module.get(StateService);
    cityServiceMock = module.get(CityService);
  });

  it('should be defined', () => {
    // Assert
    expect(locationController).toBeDefined();
  });

  it('should find all countries', () => {
    // Arrange
    const MOCK_RETURN = [
      {
        name: 'NAME',
      },
    ];
    const RESULTS = {
      data: MOCK_RETURN,
      status: 'ok',
    };
    countryServiceMock.getAll.mockReturnValue(MOCK_RETURN);

    // Assert
    expect(locationController.getLocation()).resolves.toEqual(RESULTS);
    expect(countryServiceMock.getAll).toHaveBeenCalled();
    expect(stateServiceMock.getAllRegion).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getAllCity).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getOneCity).toHaveBeenCalledTimes(0);
  });

  it('should find all states', () => {
    // Arrange
    const COUNTRY_CODE = 'CODE';
    const MOCK_RETURN = [
      {
        name: 'NAME',
      },
    ];
    const RESULTS = {
      data: MOCK_RETURN,
      status: 'ok',
    };
    stateServiceMock.getAllRegion.mockReturnValue(MOCK_RETURN);

    // Assert
    expect(locationController.getLocation(COUNTRY_CODE)).resolves.toEqual(
      RESULTS,
    );
    expect(stateServiceMock.getAllRegion).toHaveBeenCalledWith(COUNTRY_CODE);
    expect(stateServiceMock.getAllRegion).toHaveBeenCalled();
    expect(countryServiceMock.getAll).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getAllCity).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getOneCity).toHaveBeenCalledTimes(0);
  });

  it('should find all cities', () => {
    // Arrange
    const COUNTRY_CODE = 'CODE';
    const STATE_CODE = 'CODE';
    const MOCK_RETURN = [
      {
        name: 'NAME',
      },
    ];
    const RESULTS = {
      data: MOCK_RETURN,
      status: 'ok',
    };
    cityServiceMock.getAllCity.mockReturnValue(MOCK_RETURN);

    // Assert
    expect(
      locationController.getLocation(COUNTRY_CODE, STATE_CODE),
    ).resolves.toEqual(RESULTS);
    expect(cityServiceMock.getAllCity).toHaveBeenCalledWith(
      COUNTRY_CODE,
      STATE_CODE,
    );
    expect(cityServiceMock.getAllCity).toHaveBeenCalled();
    expect(countryServiceMock.getAll).toHaveBeenCalledTimes(0);
    expect(stateServiceMock.getAllRegion).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getOneCity).toHaveBeenCalledTimes(0);
  });

  it('should find one city', () => {
    // Arrange
    const COUNTRY_CODE = 'CODE';
    const STATE_CODE = 'CODE';
    const CITY_CODE = 1;
    const MOCK_RETURN = {
      name: 'NAME',
    };
    const RESULTS = {
      data: MOCK_RETURN,
      status: 'ok',
    };
    cityServiceMock.getOneCity.mockReturnValue(MOCK_RETURN);

    // Assert
    expect(
      locationController.getLocation(COUNTRY_CODE, STATE_CODE, CITY_CODE),
    ).resolves.toEqual(RESULTS);
    expect(cityServiceMock.getOneCity).toHaveBeenCalledWith(CITY_CODE);
    expect(cityServiceMock.getOneCity).toHaveBeenCalled();
    expect(countryServiceMock.getAll).toHaveBeenCalledTimes(0);
    expect(stateServiceMock.getAllRegion).toHaveBeenCalledTimes(0);
    expect(cityServiceMock.getAllCity).toHaveBeenCalledTimes(0);
  });
});
