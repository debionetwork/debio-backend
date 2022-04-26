import {
    DateTimeProxy,
    TransactionLoggingService,
  } from '../../../../../../../src/common';
  import { NotificationService } from '../../../../../../../src/endpoints/notification/notification.service'
  import { LabRegisteredCommand } from '../../../../../../../src/listeners/substrate-listener/commands/labs';
  import { Test, TestingModule } from '@nestjs/testing';
  import {
    createMockLab,
    mockBlockNumber,
    MockType,
    transactionLoggingServiceMockFactory,
    notificationServiceMockFactory,
    dateTimeProxyMockFactory,
  } from '../../../../../mock';
  import { LabRegisteredHandler } from '../../../../../../../src/listeners/substrate-listener/commands/labs/registered/lab-registered.handler';
  import { when } from 'jest-when';
  import { TransactionRequest } from '../../../../../../../src/common/modules/transaction-logging/models/transaction-request.entity';
  import { Notification } from '../../../../../../../src/endpoints/notification/models/notification.entity';
  
  describe('Lab Registered Handler Event', () => {
    let transactionLoggingServiceMock: MockType<TransactionLoggingService>;
    let notificationServiceMock: MockType<NotificationService>;
    let dateTimeProxyMock: MockType<DateTimeProxy>; // eslint-disable-line
    let labRegisteredHandler: LabRegisteredHandler;
    
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: TransactionLoggingService,
            useFactory: transactionLoggingServiceMockFactory,
          },
          {
            provide: NotificationService,
            useFactory: notificationServiceMockFactory,
          },
          {
            provide: DateTimeProxy,
            useFactory: dateTimeProxyMockFactory,
          },
          LabRegisteredHandler,
        ],
      }).compile();
  
      labRegisteredHandler = module.get(LabRegisteredHandler);
      transactionLoggingServiceMock = module.get(TransactionLoggingService);
      notificationServiceMock = module.get(NotificationService);
      dateTimeProxyMock = module.get(DateTimeProxy); // eslint-disable-line
  
      await module.init();
    });
  
    it('should defined Genetic Analyst Staked Handler', () => {
      expect(labRegisteredHandler).toBeDefined();
    });
  
    it('should not called logging service create', async () => {
      // Arrange
      const lab = createMockLab();
  
      const RESULT_STATUS = true;
      const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
      RESULT_TRANSACTION.id = BigInt(0);
      RESULT_TRANSACTION.address = 'string';
      RESULT_TRANSACTION.amount = 0;
      RESULT_TRANSACTION.created_at = new Date();
      RESULT_TRANSACTION.currency = 'string';
      RESULT_TRANSACTION.parent_id = BigInt(0);
      RESULT_TRANSACTION.ref_number = 'string';
      RESULT_TRANSACTION.transaction_type = 0;
      RESULT_TRANSACTION.transaction_status = 0;
      RESULT_TRANSACTION.transaction_hash = 'string';
  
      when(transactionLoggingServiceMock.getLoggingByHashAndStatus)
        .calledWith(lab.toHuman().accountId, 28)
        .mockReturnValue(RESULT_STATUS);
  
      const registeredLab: LabRegisteredCommand =
        new LabRegisteredCommand([lab], mockBlockNumber());
  
      await labRegisteredHandler.execute(registeredLab);
      expect(
        transactionLoggingServiceMock.getLoggingByHashAndStatus,
      ).toHaveBeenCalled();
      expect(transactionLoggingServiceMock.create).not.toHaveBeenCalled();
    });
  
    it('should called logging service create', async () => {
      // Arrange
      const lab = createMockLab();
  
      const RESULT_TRANSACTION: TransactionRequest = new TransactionRequest();
      RESULT_TRANSACTION.id = BigInt(0);
      RESULT_TRANSACTION.address = 'string';
      RESULT_TRANSACTION.amount = 0;
      RESULT_TRANSACTION.created_at = new Date();
      RESULT_TRANSACTION.currency = 'string';
      RESULT_TRANSACTION.parent_id = BigInt(0);
      RESULT_TRANSACTION.ref_number = 'string';
      RESULT_TRANSACTION.transaction_type = 0;
      RESULT_TRANSACTION.transaction_status = 0;
      RESULT_TRANSACTION.transaction_hash = 'string';
  
      when(transactionLoggingServiceMock.getLoggingByHashAndStatus).calledWith(
        lab.toHuman().accountId,
        28,
      );
  
      const labRegisteredCommand: LabRegisteredCommand =
        new LabRegisteredCommand([lab], mockBlockNumber());
  
      await labRegisteredHandler.execute(labRegisteredCommand);
      expect(
        transactionLoggingServiceMock.getLoggingByHashAndStatus,
      ).toHaveBeenCalled();
      await transactionLoggingServiceMock.create();
      await notificationServiceMock.insert();
      expect(transactionLoggingServiceMock.create).toHaveBeenCalled();
      expect(notificationServiceMock.insert).toHaveBeenCalled();
    });
  });
  