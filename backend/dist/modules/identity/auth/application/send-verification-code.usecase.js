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
var SendVerificationCodeUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVerificationCodeUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const email_service_1 = require("../../infra/services/email.service");
let SendVerificationCodeUseCase = SendVerificationCodeUseCase_1 = class SendVerificationCodeUseCase {
    prisma;
    emailService;
    logger = new common_1.Logger(SendVerificationCodeUseCase_1.name);
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async execute(email, language = 'PT') {
        this.logger.log(`[SendVerification] Attempting to send code to: ${email} (lang: ${language})`);
        const existingUser = await this.prisma.tenant.findUnique({ where: { email } });
        if (existingUser) {
            this.logger.warn(`[SendVerification] Email already registered: ${email}`);
            throw new common_1.ConflictException('Este e-mail já está cadastrado. Faça login ou utilize outro e-mail.');
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.verificationCode.upsert({
            where: { email },
            update: { code, expiresAt },
            create: { email, code, expiresAt },
        });
        this.logger.log(`[SendVerification] Code saved to DB for ${email}`);
        await this.emailService.sendVerificationEmail(email, code, language);
        this.logger.log(`[SendVerification] Email sent successfully to ${email}`);
    }
};
exports.SendVerificationCodeUseCase = SendVerificationCodeUseCase;
exports.SendVerificationCodeUseCase = SendVerificationCodeUseCase = SendVerificationCodeUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], SendVerificationCodeUseCase);
//# sourceMappingURL=send-verification-code.usecase.js.map