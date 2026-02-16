import { PrismaService } from '../../../../infra/database/prisma.service';
export declare class LogoutUseCase {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(userId: string): Promise<void>;
}
