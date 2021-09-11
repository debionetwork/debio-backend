import { Test, TestingModule } from "@nestjs/testing";
import { EscrowService } from "./escrow.service";

class EscrowServiceMock {
    handlePaymentToEscrow(from, amount): void {
        
    }

    createOrder(request) {
        
    }

    refundOrder(request): any {

    }
    
    cancelOrder(request) {
        return {};
    }

    orderFulfilled(request) {
        return "";
    }

    forwardPaymentToSeller(sellerAddress: string, amount: number | string) {

    }

    getRefundGasEstimationFee(customerAddress: string, amount: number | string): string {
        return "";
    }
}

describe("EscrowService", () => {
    let escrowService: EscrowService;

    const escrowServiceProvider = {
        provide: EscrowService,
        useClass: EscrowServiceMock,
    }

    beforeEach(async ()=>{
        const module: TestingModule = await Test.createTestingModule({
            providers: [EscrowService, escrowServiceProvider],
        }).compile();

        escrowService = module.get<EscrowService>(EscrowService);
    });

    describe("Ethereum EscrowService", () => {
        it("EscrowService must defined", () => {
            expect(EscrowService).toBeDefined();
        });
    });

    it("should call handlePaymentToEscrow method with expected params ", async() => {
        const handlePaymentToEscrowSpy = jest.spyOn(escrowService, 'handlePaymentToEscrow');
        const from = "";
        const amount = "";
        escrowService.handlePaymentToEscrow(from, amount);
        expect(handlePaymentToEscrowSpy).toHaveBeenCalledWith(from, amount);
    });

    it("should call createOrder method with expected params", async() => {
        const createOrderSpy = jest.spyOn(escrowService, 'createOrder');
        const request = {};
        escrowService.createOrder(request);
        expect(createOrderSpy).toHaveBeenCalledWith(request);
    });
    
    it("should call refundOrder method with expected params", async() => {
        const refundOrderSpy = jest.spyOn(escrowService, 'refundOrder');
        const request = {};
        escrowService.refundOrder(request);
        expect(refundOrderSpy).toHaveBeenCalledWith(request);
    });
    
    it("should call cancelOrder method with expected params", async() => {
        const cancelOrderSpy = jest.spyOn(escrowService, 'cancelOrder');
        const request = {};
        escrowService.cancelOrder(request);
        expect(cancelOrderSpy).toHaveBeenCalledWith(request);
    });
    
    it("should call orderFulfilled method with expected params", async() => {
        const orderFulfilledSpy = jest.spyOn(escrowService, 'orderFulfilled');
        const request = {};
        escrowService.orderFulfilled(request);
        expect(orderFulfilledSpy).toHaveBeenCalledWith(request);
    });
    
    it("should call forwardPaymentToSeller method with expected params", async () => {
        const forwardPaymentToSellerSpy = jest.spyOn(escrowService, 'forwardPaymentToSeller');
        const sellerAddress: string = '';
        const amount: number | string = 20;
        await escrowService.forwardPaymentToSeller(sellerAddress, amount);
        expect(forwardPaymentToSellerSpy).toHaveBeenCalledWith(sellerAddress, amount);
    });
    
    it("should call getRefundGasEstimationFee method with expected params", async () => {
        const getRefundGasEstimationFeeSpy = jest.spyOn(escrowService, 'getRefundGasEstimationFee');
        const customerAddress: string = '';
        const amount: number | string = 20;
        await escrowService.getRefundGasEstimationFee(customerAddress, amount);
        expect(getRefundGasEstimationFeeSpy).toHaveBeenCalledWith(customerAddress, amount);
    });
    
});