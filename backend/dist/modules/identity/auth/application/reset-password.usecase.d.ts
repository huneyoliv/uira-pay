import { PrismaService } from '../../../../infra/database/prisma.service';
import { IPasswordHasher } from '../domain/password.hasher.interface';
export declare class ResetPasswordUseCase {
    private readonly prisma;
    private readonly passwordHasher;
    constructor(prisma: PrismaService, passwordHasher: IPasswordHasher);
    execute(email: string, code: string, newPassword: string): Promise<void>;
}
