import { TestingModule, Test } from '@nestjs/testing';
import { RecaptchaController } from './recaptcha.controller';

describe('RecaptchaController', () => {
  let recaptchaController: RecaptchaController;

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecaptchaController],
    }).compile();

    recaptchaController = module.get<RecaptchaController>(RecaptchaController);
  });

  describe('Initialize Recaptcha Controller', () => {
    it('RecaptchaController must defined', () => {
      expect(recaptchaController).toBeDefined();
    });
  });

  describe('Response Recaptcha', () => {
    // response json expected because request body to recaptcha is random
    const expectedResponseData = {
      success: false,
      'error-codes': ['invalid-input-secret'],
    };

    let responseRecaptcha;

    it('Recaptcha response status 200', async () => {
      const res = mockResponse();
      responseRecaptcha = await recaptchaController.recaptcha({}, res);
      expect(responseRecaptcha.status).toHaveBeenCalledWith(200);
    });

    it('Recaptcha response data', async () => {
      expect(responseRecaptcha.json).toHaveBeenCalledWith(expectedResponseData);
    });
  });
});
