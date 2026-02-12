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
exports.VerifyCodeUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
let VerifyCodeUseCase = class VerifyCodeUseCase {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async execute(email, code) {
        const record = await this.prisma.verificationCode.findUnique({ where: { email } });
        if (!record) {
            throw new common_1.BadRequestException('Verification code not found or expired');
        }
        if (record.code !== code) {
            throw new common_1.BadRequestException('Invalid code');
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Code expired');
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const verificationToken = this.jwtService.sign({ email, verified: true }, { secret, expiresIn: '1h' });
        await this.prisma.verificationCode.delete({ where: { email } });
        return { verificationToken };
    }
};
exports.VerifyCodeUseCase = VerifyCodeUseCase;
exports.VerifyCodeUseCase = VerifyCodeUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], VerifyCodeUseCase);
//# sourceMappingURL=verify-code.usecase.js.map