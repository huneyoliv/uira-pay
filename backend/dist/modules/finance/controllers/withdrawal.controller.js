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
exports.WithdrawalController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../identity/auth/infra/guards/jwt-auth.guard");
const crypto_fee_service_1 = require("../providers/crypto-fee.service");
const request_withdrawal_usecase_1 = require("../application/request-withdrawal.usecase");
const prisma_service_1 = require("../../../infra/database/prisma.service");
let WithdrawalController = class WithdrawalController {
    cryptoFeeService;
    requestWithdrawalUseCase;
    prisma;
    constructor(cryptoFeeService, requestWithdrawalUseCase, prisma) {
        this.cryptoFeeService = cryptoFeeService;
        this.requestWithdrawalUseCase = requestWithdrawalUseCase;
        this.prisma = prisma;
    }
    async getFees(req) {
        const tenantId = req.user.id;
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const currency = tenant?.default_currency || 'USDT';
        return this.cryptoFeeService.getAvailableNetworks(currency);
    }
    async requestWithdrawal(req, body) {
        const tenantId = req.user.id;
        return await this.requestWithdrawalUseCase.execute({
            tenantId,
            amount: body.amount,
            network: body.network,
            address: body.address,
            save_wallet: body.save_wallet,
            nickname: body.nickname,
        });
    }
};
exports.WithdrawalController = WithdrawalController;
__decorate([
    (0, common_1.Get)('fees'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "getFees", null);
__decorate([
    (0, common_1.Post)('request'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WithdrawalController.prototype, "requestWithdrawal", null);
exports.WithdrawalController = WithdrawalController = __decorate([
    (0, common_1.Controller)('withdrawals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [crypto_fee_service_1.CryptoFeeService,
        request_withdrawal_usecase_1.RequestWithdrawalUseCase,
        prisma_service_1.PrismaService])
], WithdrawalController);
//# sourceMappingURL=withdrawal.controller.js.map