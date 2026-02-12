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
exports.WithdrawController = void 0;
const common_1 = require("@nestjs/common");
const withdraw_dto_1 = require("../dtos/withdraw.dto");
const withdraw_usecase_1 = require("../application/withdraw.usecase");
const jwt_auth_guard_1 = require("../../identity/auth/infra/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../identity/auth/infra/decorators/current-user.decorator");
let WithdrawController = class WithdrawController {
    withdrawUseCase;
    constructor(withdrawUseCase) {
        this.withdrawUseCase = withdrawUseCase;
    }
    async withdraw(body, user) {
        const txHash = await this.withdrawUseCase.execute(user.id, body.amount, body.address, body.network);
        return {
            success: true,
            txHash,
        };
    }
};
exports.WithdrawController = WithdrawController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [withdraw_dto_1.WithdrawDto, Object]),
    __metadata("design:returntype", Promise)
], WithdrawController.prototype, "withdraw", null);
exports.WithdrawController = WithdrawController = __decorate([
    (0, common_1.Controller)('withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [withdraw_usecase_1.WithdrawUseCase])
], WithdrawController);
//# sourceMappingURL=withdraw.controller.js.map