import { WithdrawDto } from '../dtos/withdraw.dto';
import { WithdrawUseCase } from '../application/withdraw.usecase';
export declare class WithdrawController {
    private readonly withdrawUseCase;
    constructor(withdrawUseCase: WithdrawUseCase);
    withdraw(body: WithdrawDto, user: any): Promise<{
        success: boolean;
        txHash: string;
    }>;
}
