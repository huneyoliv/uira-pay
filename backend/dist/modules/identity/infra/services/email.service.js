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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const { Resend } = require('resend');
const email_templates_1 = require("./email-templates");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    resend;
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY not configured. Emails will not be sent.');
        }
        this.resend = new Resend(apiKey || 'dummy');
    }
    getSenderEmail() {
        const domain = process.env.DOMAIN || 'swaptune.me';
        return `Uirá Payments <noreply@${domain}>`;
    }
    async sendVerificationEmail(to, code, language = 'PT') {
        const template = (0, email_templates_1.getEmailTemplate)('verification', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }
    async sendPasswordResetEmail(to, code, language = 'PT') {
        const template = (0, email_templates_1.getEmailTemplate)('passwordReset', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }
    async sendSecurityCodeEmail(to, code, language = 'PT') {
        const template = (0, email_templates_1.getEmailTemplate)('securityCode', code, language);
        await this.sendEmail(to, template.subject, template.html);
    }
    async sendSecurityNotification(to, type, language = 'PT', extra) {
        const template = (0, email_templates_1.getEmailTemplate)(type, '', language, extra);
        await this.sendEmail(to, template.subject, template.html);
    }
    async sendEmail(to, subject, html) {
        try {
            await this.resend.emails.send({
                from: this.getSenderEmail(),
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
        }
        catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map