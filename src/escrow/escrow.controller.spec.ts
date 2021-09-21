import { Test, TestingModule } from "@nestjs/testing";
import { EscrowController } from "./escrow.controller";

describe("EscrowController", () => {
    let escrowController: EscrowController;
    
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EscrowController],
        }).compile();

        escrowController = module.get<EscrowController>(EscrowController);
    });

    describe("root", () => {
        it('Escrow Controller must defined', () => {
            expect(escrowController).toBeDefined();
        });
    });
});