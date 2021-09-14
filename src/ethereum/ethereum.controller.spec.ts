import { Test, TestingModule } from "@nestjs/testing";
import { EscrowService } from "../escrow/escrow.service";
import { EthereumController } from "./ethereum.controller";
import { EthereumService } from "./ethereum.service";

describe("EthereumController", () => {
    let ethereumController: EthereumController;
    let ethereumService: EthereumService;
    let escrowService: EscrowService;

    const escrowServiceProvider = {
        provide: EscrowService,
        useFactory: () => ({
            handlePaymentToEscrow: jest.fn(() => {}),
            createOrder: jest.fn(),
            refundOrder: jest.fn(),
            cancelOrder: jest.fn(),
            orderFulfilled: jest.fn(),
            forwardPaymentToSeller: jest.fn(),
            getRefundGasEstimationFee: jest.fn(() => ""),
        })
    };

    const ethereumServiceProvider = {
        provide: EthereumService,
        useFactory: () => ({
            getLastBlock: jest.fn(() => 5484750),
            setLastBlock: jest.fn(),
            getContract: jest.fn(() => ({
                provider: {
                    getBlockNumber: () => 5484751,
                    on: () => null,
                    emit: jest.fn(() => {}),
                },
                on: () => null,
                filters: {
                    Transfer: () => null
                },
                emit: jest.fn(() => {}),
            })),
            createWallet: jest.fn(),
            getGasEstimationFee: jest.fn(() => ""),
            convertCurrency: jest.fn(),
        })
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EthereumController],
            providers: [EscrowService, escrowServiceProvider, EthereumService, ethereumServiceProvider]
        }).compile();

        ethereumController  = module.get<EthereumController>(EthereumController);
        ethereumService = module.get<EthereumService>(EthereumService);
        escrowService = module.get<EscrowService>(EscrowService);
    });

    it("EthereumController must defined", () => {
        expect(ethereumController).toBeDefined();
    });
    
    it("EthereumService must defined", () => {
        expect(ethereumService).toBeDefined();
    });
    
    it("EscrowService must defined", () => {
        expect(escrowService).toBeDefined();
    });

    describe("EthereumController when method OnApplicationBootstrap called", () => {

        it("getContract is called when onApplicationBootstrap called", async () => {
            await ethereumController.onApplicationBootstrap();

            expect(ethereumService.getContract).toBeCalled();
        });

        it("getLastBlock is called when onApplicationBootstrap called", async () => {
            await ethereumController.onApplicationBootstrap();
            expect(ethereumService.getLastBlock).toBeCalled();
        });

        it("setLastBlock is called when onApplicationBootstrap called", async () => {
            await ethereumController.onApplicationBootstrap();
            expect(ethereumService.setLastBlock).toBeCalled();
        });

        it("ethereumService.setLastBlock is called when contract provider event block is listen", async () => {
            await ethereumController.onApplicationBootstrap();
            const contract = await ethereumService.getContract();
            contract.provider.emit('block');
            expect(ethereumService.setLastBlock).toBeCalled();
        });
    });
});