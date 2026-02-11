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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let EmailService = class EmailService {
    configService;
    apiKey;
    apiUrl = 'https://api.resend.com/emails';
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('RESEND_API_KEY') || '';
    }
    async sendVerificationEmail(to, code) {
        if (!this.apiKey) {
            console.error('RESEND_API_KEY is missing');
            return;
        }
        try {
            await axios_1.default.post(this.apiUrl, {
                from: this.configService.get('DOMAIN')
                    ? `Uirá Payments <onboarding@${this.configService.get('DOMAIN')}>`
                    : 'Uirá Payments <onboarding@resend.dev>',
                to: [to],
                subject: 'Seu código de verificação Uirá',
                html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h1>Bem-vindo ao Uirá Payments!</h1>
                            <p>Seu código de verificação é:</p>
                            <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${code}</h2>
                            <p>Este código expira em 15 minutos.</p>
                        </div>
                    `,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
        }
        catch (error) {
            console.error('Failed to send email:', error.response?.data || error.message);
            throw new common_1.InternalServerErrorException('Failed to send verification email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map