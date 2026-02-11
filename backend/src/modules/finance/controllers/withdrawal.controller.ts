import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';
import { CryptoFeeService } from '../providers/crypto-fee.service';
import { RequestWithdrawalUseCase } from '../application/request-withdrawal.usecase';
import { PrismaService } from '../../../infra/database/prisma.service';

@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalController {
    constructor(
        private readonly cryptoFeeService: CryptoFeeService,
        private readonly requestWithdrawalUseCase: RequestWithdrawalUseCase,
        private readonly prisma: PrismaService,
    ) { }

    @Get('fees')
    async getFees(@Request() req: any) {
        const tenantId = req.user.id;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const currency = tenant?.default_currency || 'USDT';

        return this.cryptoFeeService.getAvailableNetworks(currency);
    }

    @Post('request')
    async requestWithdrawal(
        @Request() req: any,
        @Body() body: { amount: number; network: string; address: string; save_wallet?: boolean; nickname?: string }
    ) {
        const tenantId = req.user.id;
        return await this.requestWithdrawalUseCase.execute({
            tenantId,
            amount: body.amount,
            network: body.network,
            address: body.address,
            save_wallet: body.save_wallet,
            nickname: body.nickname,
        });
    }
}
