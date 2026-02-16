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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const email_templates_1 = require("./email-templates");
let EmailService = EmailService_1 = class EmailService {
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    apiUrl = 'https://api.resend.com/emails';
    constructor(configService) {
        this.configService = configService;
    }
    getApiKey() {
        return this.configService.get('RESEND_API_KEY') || process.env.RESEND_API_KEY || '';
    }
    getDomain() {
        return this.configService.get('DOMAIN') || process.env.DOMAIN || '';
    }
    async sendVerificationEmail(to, code, language = 'PT') {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Sending verification email to: ${to} (lang: ${language})`);
        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing!');
            throw new common_1.InternalServerErrorException('Email service not configured');
        }
        const domain = this.getDomain();
        const fromAddress = domain
            ? `Uirá Payments <onboarding@${domain}>`
            : 'Uirá Payments <onboarding@resend.dev>';
        const template = (0, email_templates_1.getEmailTemplate)('verification', code, language);
        try {
            const response = await axios_1.default.post(this.apiUrl, {
                from: fromAddress,
                to: [to],
                subject: template.subject,
                html: template.html,
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`[Email] Verification email sent (lang: ${language}): ${JSON.stringify(response.data)}`);
        }
        catch (error) {
            this.logger.error(`[Email] Failed to send verification email to ${to}:`, error.response?.data || error.message);
            throw new common_1.InternalServerErrorException('Failed to send verification email');
        }
    }
    async sendPasswordResetEmail(to, code, language = 'PT') {
        const apiKey = this.getApiKey();
        this.logger.log(`[Email] Sending password reset email to: ${to} (lang: ${language})`);
        if (!apiKey) {
            this.logger.error('[Email] RESEND_API_KEY is missing!');
            throw new common_1.InternalServerErrorException('Email service not configured');
        }
        const domain = this.getDomain();
        const fromAddress = domain
            ? `Uirá Payments <security@${domain}>`
            : 'Uirá Payments <security@resend.dev>';
        const template = (0, email_templates_1.getEmailTemplate)('passwordReset', code, language);
        try {
            const response = await axios_1.default.post(this.apiUrl, {
                from: fromAddress,
                to: [to],
                subject: template.subject,
                html: template.html,
            }, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`[Email] Password reset email sent (lang: ${language}): ${JSON.stringify(response.data)}`);
        }
        catch (error) {
            this.logger.error(`[Email] Failed to send password reset email to ${to}:`, error.response?.data || error.message);
            throw new common_1.InternalServerErrorException('Failed to send password reset email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map