import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';
export declare class SendVerificationCodeUseCase {
    private readonly prisma;
    private readonly emailService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService);
    execute(email: string, language?: string): Promise<void>;
}
