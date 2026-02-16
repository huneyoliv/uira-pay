import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            throw new ForbiddenException('Authentication required');
        }

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: user.id },
        });

        if (!tenant || !(tenant as any).isAdmin) {
            throw new ForbiddenException('Admin access required');
        }

        return true;
    }
}
