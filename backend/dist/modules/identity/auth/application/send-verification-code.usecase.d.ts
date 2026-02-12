import { PrismaService } from '../../../../infra/database/prisma.service';
import { EmailService } from '../../infra/services/email.service';
export declare class SendVerificationCodeUseCase {
    private readonly prisma;
    private readonly emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    execute(email: string): Promise<void>;
}
