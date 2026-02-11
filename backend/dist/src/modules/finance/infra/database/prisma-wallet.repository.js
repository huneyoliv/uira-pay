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
exports.PrismaWalletRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../infra/database/prisma.service");
const wallet_mapper_1 = require("./wallet.mapper");
let PrismaWalletRepository = class PrismaWalletRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByTenantId(tenantId) {
        const prismaWallet = await this.prisma.wallet.findFirst({
            where: { tenant_id: tenantId },
        });
        if (!prismaWallet) {
            return null;
        }
        return wallet_mapper_1.WalletMapper.toDomain(prismaWallet);
    }
    async save(wallet) {
        const data = wallet_mapper_1.WalletMapper.toPersistence(wallet);
        await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: data.balance,
                updated_at: data.updated_at,
            },
        });
    }
    async create(wallet) {
        const data = wallet_mapper_1.WalletMapper.toPersistence(wallet);
        await this.prisma.wallet.create({
            data,
        });
    }
    async addTransaction(walletId, amount, type, status) {
        await this.prisma.transaction.create({
            data: {
                wallet_id: walletId,
                amount: amount,
                type: type,
                status: status,
                fee: 0,
            },
        });
    }
};
exports.PrismaWalletRepository = PrismaWalletRepository;
exports.PrismaWalletRepository = PrismaWalletRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaWalletRepository);
//# sourceMappingURL=prisma-wallet.repository.js.map