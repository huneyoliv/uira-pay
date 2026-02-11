import { PrismaService } from '../../../../infra/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class VerifyCodeUseCase {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    execute(email: string, code: string): Promise<{
        verificationToken: string;
    }>;
}
