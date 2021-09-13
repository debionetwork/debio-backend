import { Test, TestingModule } from "@nestjs/testing";
import { EscrowService } from "../escrow/escrow.service";
import { EthereumController } from "./ethereum.controller";
import { EthereumService } from "./ethereum.service";

describe("EthereumController", () => {
    let ethereumController: EthereumController;
    let ethereumService: EthereumService;

    const mockEscrowService = {

    }

    const escrowServiceProvider = {
        provide: EscrowService,
        useValue: mockEscrowService
    }

    const ethereumServiceProvider = {
        provide: EthereumService,
        useFactory: () => ({
            getLastBlock: jest.fn(() => 5484750),
            setLastBlock: jest.fn(),
            getContract: jest.fn(() => ({
                provider: {
                    getBlockNumber: () => 5484751,
                    on: () => null,
                },
                on: () => null,
                filters: {
                    Transfer: () => null
                }
            })),
            createWallet: jest.fn(),
            getGasEstimationFee: jest.fn(() => ""),
            convertCurrency: jest.fn(),
        })
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EthereumController],
            providers: [escrowServiceProvider, EthereumService, ethereumServiceProvider]
        }).compile();

        ethereumController  = module.get<EthereumController>(EthereumController);
        ethereumService = module.get<EthereumService>(EthereumService);
    });

    describe("EthereumController", () => {
        it("EthereumController must defined", () => {
            expect(ethereumController).toBeDefined();
        });


        it("getContract called", async () => {
            await ethereumController.onApplicationBootstrap();

            expect(ethereumService.getContract).toBeCalled();
        })

        it("getLastBlock called", async () => {
            expect(ethereumService.getLastBlock).toBeCalled();
        })

        it("setLastBlock called", async () => {
            expect(ethereumService.setLastBlock).toBeCalled();
        })
    });
});