import { Controller, Get, Delete, Param, UseGuards, Request, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../identity/auth/infra/guards/jwt-auth.guard';
import { PrismaService } from '../../../infra/database/prisma.service';

function isValidObjectId(id: string): boolean {
    return /^[a-f\d]{24}$/i.test(id);
}

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('saved')
    async getSavedWallets(@Request() req: any) {
        const tenantId = req.user.id;
        const wallets = await this.prisma.savedWallet.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: 'desc' }
        });
        return wallets;
    }

    @Delete('saved/:id')
    async deleteSavedWallet(@Request() req: any, @Param('id') id: string) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('Invalid wallet ID');
        }

        const tenantId = req.user.id;
        const wallet = await this.prisma.savedWallet.findUnique({ where: { id } });

        if (!wallet || wallet.tenant_id !== tenantId) {
            throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
        }

        await this.prisma.savedWallet.delete({ where: { id } });
        return { message: 'Wallet deleted' };
    }
}
