"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const password_hasher_interface_1 = require("../domain/password.hasher.interface");
let ResetPasswordUseCase = class ResetPasswordUseCase {
    prisma;
    passwordHasher;
    constructor(prisma, passwordHasher) {
        this.prisma = prisma;
        this.passwordHasher = passwordHasher;
    }
    async execute(email, code, newPassword) {
        const record = await this.prisma.verificationCode.findUnique({ where: { email } });
        if (!record) {
            throw new common_1.BadRequestException('Invalid or expired code');
        }
        if (record.code !== code) {
            throw new common_1.BadRequestException('Invalid code');
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Code expired');
        }
        const hashedPassword = await this.passwordHasher.hash(newPassword);
        await this.prisma.tenant.update({
            where: { email },
            data: {
                password: hashedPassword,
                tokenVersion: { increment: 1 },
            },
        });
        await this.prisma.verificationCode.delete({ where: { email } });
    }
};
exports.ResetPasswordUseCase = ResetPasswordUseCase;
exports.ResetPasswordUseCase = ResetPasswordUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_hasher_interface_1.IPasswordHasher])
], ResetPasswordUseCase);
//# sourceMappingURL=reset-password.usecase.js.map