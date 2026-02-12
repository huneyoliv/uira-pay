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
exports.UpdateConfigDto = exports.Currency = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var Currency;
(function (Currency) {
    Currency["USDT"] = "USDT";
    Currency["USDC"] = "USDC";
})(Currency || (exports.Currency = Currency = {}));
class UpdateConfigDto {
    defaultCurrency;
    docNumber;
    language;
    theme;
    currentPassword;
}
exports.UpdateConfigDto = UpdateConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: Currency, required: false, description: 'Default currency' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Currency),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "defaultCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12345678000195', required: false, description: 'Document number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "docNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pt-BR', required: false, description: 'Language' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'system', required: false, description: 'Theme preference (light, dark, system)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Current password (required when changing docNumber)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConfigDto.prototype, "currentPassword", void 0);
//# sourceMappingURL=update-config.dto.js.map