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
exports.RequestWithdrawalDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RequestWithdrawalDto {
    amount;
    network;
    address;
    save_wallet;
    nickname;
}
exports.RequestWithdrawalDto = RequestWithdrawalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Amount to withdraw' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(10),
    __metadata("design:type", Number)
], RequestWithdrawalDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRC20', description: 'Blockchain network or BINANCE_INTERNAL' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestWithdrawalDto.prototype, "network", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TXyz123...', description: 'Destination wallet address or Binance email' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestWithdrawalDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, required: false, description: 'Save wallet for future use' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RequestWithdrawalDto.prototype, "save_wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'My Wallet', required: false, description: 'Nickname for saved wallet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestWithdrawalDto.prototype, "nickname", void 0);
//# sourceMappingURL=request-withdrawal.dto.js.map