import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infra/database/prisma.service';

@Injectable()
export class LogoutUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(userId: string): Promise<void> {
        await this.prisma.tenant.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
    }
}
