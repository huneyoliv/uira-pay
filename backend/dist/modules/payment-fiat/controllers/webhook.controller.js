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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const efi_hmac_guard_1 = require("../guards/efi-hmac.guard");
const credit_balance_usecase_1 = require("../../finance/application/credit-balance.usecase");
const calculate_exchange_usecase_1 = require("../../finance/application/calculate-exchange.usecase");
const prisma_service_1 = require("../../../infra/database/prisma.service");
let WebhookController = class WebhookController {
    creditBalanceUseCase;
    calculateExchangeUseCase;
    prisma;
    constructor(creditBalanceUseCase, calculateExchangeUseCase, prisma) {
        this.creditBalanceUseCase = creditBalanceUseCase;
        this.calculateExchangeUseCase = calculateExchangeUseCase;
        this.prisma = prisma;
    }
    async handleWebhook(payload) {
        if (!payload || !payload.pix) {
            return { status: 200 };
        }
        for (const pix of payload.pix) {
            if (pix.status === 'CONCLUIDA') {
                const txid = pix.txid;
                const amount = Number(pix.valor);
                const payerName = pix.pagador?.nome;
                const payerDocument = pix.pagador?.cpf || pix.pagador?.cnpj;
                const order = await this.prisma.order.findUnique({
                    where: { txid: txid },
                });
                if (!order) {
                    console.warn(`Order not found for txid: ${txid}`);
                    continue;
                }
                if (order.status === 'PAID' || order.status === 'COMPLETED') {
                    console.log(`Order ${order.id} already paid.`);
                    continue;
                }
                try {
                    await this.creditBalanceUseCase.execute(order.tenant_id, order.crypto_amount_est);
                    await this.prisma.order.update({
                        where: { id: order.id },
                        data: {
                            status: 'PAID',
                            payerName: payerName,
                            payerDocument: payerDocument
                        },
                    });
                    console.log(`Order ${order.id} processed successfully.`);
                }
                catch (error) {
                    console.error(`Failed to process order ${order.id}:`, error);
                }
            }
        }
        return { status: 200 };
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('pix'),
    (0, common_1.UseGuards)(efi_hmac_guard_1.EfiHmacGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleWebhook", null);
exports.WebhookController = WebhookController = __decorate([
    (0, common_1.Controller)('webhooks/efi'),
    __metadata("design:paramtypes", [credit_balance_usecase_1.CreditBalanceUseCase,
        calculate_exchange_usecase_1.CalculateExchangeUseCase,
        prisma_service_1.PrismaService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map