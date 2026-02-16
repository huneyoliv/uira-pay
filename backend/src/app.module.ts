import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/identity/auth/auth.module';
import { IdentityModule } from './modules/identity/identity.module';
import { PaymentCryptoModule } from './modules/payment-crypto/payment-crypto.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { InfraModule } from './infra/infra.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    InfraModule,
    AuthModule,
    IdentityModule,
    PaymentCryptoModule,
    JobsModule,
    UploadModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
