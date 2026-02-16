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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const create_order_dto_1 = require("../dtos/create-order.dto");
const calculate_exchange_usecase_1 = require("../../finance/application/calculate-exchange.usecase");
const efi_gateway_provider_1 = require("../providers/efi-gateway.provider");
const bcb_service_1 = require("../../finance/providers/bcb.service");
const jwt_auth_guard_1 = require("../../identity/auth/infra/guards/jwt-auth.guard");
const prisma_service_1 = require("../../../infra/database/prisma.service");
const current_user_decorator_1 = require("../../identity/auth/infra/decorators/current-user.decorator");
let OrderController = class OrderController {
    calculateExchangeUseCase;
    efiGatewayProvider;
    prisma;
    bcbService;
    constructor(calculateExchangeUseCase, efiGatewayProvider, prisma, bcbService) {
        this.calculateExchangeUseCase = calculateExchangeUseCase;
        this.efiGatewayProvider = efiGatewayProvider;
        this.prisma = prisma;
        this.bcbService = bcbService;
    }
    async createOrder(body, user) {
        const MAX_ORDER_AMOUNT = 50000;
        const MAX_PENDING_ORDERS = 5;
        if (body.amount > MAX_ORDER_AMOUNT) {
            throw new common_1.BadRequestException(`Maximum order amount is R$ ${MAX_ORDER_AMOUNT.toLocaleString()}`);
        }
        const pendingCount = await this.prisma.order.count({
            where: { tenant_id: user.id, status: 'PENDING' },
        });
        if (pendingCount >= MAX_PENDING_ORDERS) {
            throw new common_1.BadRequestException(`Maximum of ${MAX_PENDING_ORDERS} pending orders allowed`);
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: user.id } });
        const currency = tenant?.fiatCurrency || 'BRL';
        let amountBrl = body.amount;
        let exchangeRateBcb = 1;
        if (currency !== 'BRL') {
            exchangeRateBcb = await this.bcbService.getExchangeRate(currency);
            amountBrl = body.amount * exchangeRateBcb;
        }
        let usdBrlRate = exchangeRateBcb;
        if (currency === 'BRL') {
            usdBrlRate = await this.bcbService.getExchangeRate('USD');
        }
        const exchangeResult = this.calculateExchangeUseCase.execute(amountBrl, usdBrlRate);
        const pixCharge = await this.efiGatewayProvider.createPixCharge(amountBrl);
        const order = await this.prisma.order.create({
            data: {
                tenant_id: user.id,
                fiat_amount: amountBrl,
                crypto_amount_est: exchangeResult.netCryptoAmount,
                status: 'PENDING',
                pix_code: pixCharge.pixCode,
                txid: pixCharge.txid,
            },
        });
        return {
            id: order.id,
            pixCode: pixCharge.pixCode,
            txid: pixCharge.txid,
            exchangeRate: exchangeResult.exchangeRate,
            netCryptoAmount: exchangeResult.netCryptoAmount,
            totalFeeBrl: exchangeResult.totalFeeBrl,
            originalAmount: body.amount,
            originalCurrency: currency,
            conversionRate: exchangeRateBcb,
        };
    }
    async getOrder(id, user) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order || order.tenant_id !== user.id) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrder", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [calculate_exchange_usecase_1.CalculateExchangeUseCase,
        efi_gateway_provider_1.EfiGatewayProvider,
        prisma_service_1.PrismaService,
        bcb_service_1.BcbService])
], OrderController);
//# sourceMappingURL=order.controller.js.map