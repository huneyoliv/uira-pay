import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { WithdrawUseCase } from '../application/withdraw.usecase';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '../../identity/auth/infra/decorators/current-user.decorator';

@Controller('withdraw')
@UseGuards(JwtAuthGuard)
export class WithdrawController {
    constructor(private readonly withdrawUseCase: WithdrawUseCase) { }

    @Post()
    async withdraw(@Body() body: WithdrawDto, @CurrentUser() user: any) {
        const txHash = await this.withdrawUseCase.execute(
            user.id,
            body.amount,
            body.address,
            body.network,
        );

        return {
            success: true,
            txHash,
        };
    }
}
