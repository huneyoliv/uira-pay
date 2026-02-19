"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const finance_module_1 = require("../finance/finance.module");
const payment_fiat_module_1 = require("../payment-fiat/payment-fiat.module");
const payment_crypto_module_1 = require("../payment-crypto/payment-crypto.module");
const check_pending_orders_job_1 = require("./check-pending-orders.job");
const gas_monitor_job_1 = require("./gas-monitor.job");
const liquidity_manager_job_1 = require("./liquidity-manager.job");
const check_pending_withdrawals_job_1 = require("./check-pending-withdrawals.job");
const cleanup_expired_codes_job_1 = require("./cleanup-expired-codes.job");
const prisma_service_1 = require("../../infra/database/prisma.service");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            finance_module_1.FinanceModule,
            payment_fiat_module_1.PaymentFiatModule,
            payment_crypto_module_1.PaymentCryptoModule,
        ],
        providers: [
            check_pending_orders_job_1.CheckPendingOrdersJob,
            gas_monitor_job_1.GasMonitorJob,
            liquidity_manager_job_1.LiquidityManagerJob,
            check_pending_withdrawals_job_1.CheckPendingWithdrawalsJob,
            cleanup_expired_codes_job_1.CleanupExpiredCodesJob,
            prisma_service_1.PrismaService,
        ],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map