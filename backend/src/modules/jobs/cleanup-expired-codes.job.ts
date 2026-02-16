import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infra/database/prisma.service';

@Injectable()
export class CleanupExpiredCodesJob {
    private readonly logger = new Logger(CleanupExpiredCodesJob.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        try {
            const result = await this.prisma.verificationCode.deleteMany({
                where: {
                    expiresAt: { lt: new Date() },
                },
            });

            if (result.count > 0) {
                this.logger.log(`Cleaned up ${result.count} expired verification code(s).`);
            }
        } catch (error) {
            this.logger.error('Failed to cleanup expired verification codes', error);
        }
    }
}
