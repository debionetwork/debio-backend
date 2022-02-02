import { EmailNotificationService, MailerManager, SubstrateService, ProcessEnvProxy } from "../../../../src/common";
import { emailNotificationServiceMockFactory, mailerManagerMockFactory, MockType, substrateServiceMockFactory } from "../../../../test/unit/mock";
import { EmailEndpointController } from "../../../../src/endpoints/email/email.controller";
import { Test, TestingModule } from "@nestjs/testing";

describe('Email Controller', () => {
	let emailEndpointControllerMock : EmailEndpointController;
	let mailerManageMock: MockType<MailerManager>;
	let substrateServiceMock: MockType<SubstrateService>;
	let emailNotificationServiceMock: MockType<EmailNotificationService>
	const EMAILS = 'email';

	class ProcessEnvProxyMock {
		env = { EMAILS };
	}

	//Arrange before each iteration
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EmailEndpointController,
				{
					provide: ProcessEnvProxy,
					useClass: ProcessEnvProxyMock
				},
				{
					provide: MailerManager,
					useFactory: mailerManagerMockFactory,
				},
				{
					provide: SubstrateService,
					useFactory: substrateServiceMockFactory,
				},
				{
					provide: EmailNotificationService,
					useFactory: emailNotificationServiceMockFactory,
				},
			],
		}).compile();

		emailEndpointControllerMock = module.get<EmailEndpointController>(EmailEndpointController);
		mailerManageMock = module.get(MailerManager);
		substrateServiceMock = module.get(SubstrateService);
	});

	it('should be defined', () => {
		expect(emailEndpointControllerMock).toBeDefined();
	});
});