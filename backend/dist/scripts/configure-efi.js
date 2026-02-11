"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const efi_gateway_provider_1 = require("../src/modules/payment-fiat/providers/efi-gateway.provider");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const efiProvider = app.get(efi_gateway_provider_1.EfiGatewayProvider);
    console.log('Configuring Efí Webhook settings...');
    try {
        try {
            console.log('Testing connection (Get Balance)...');
            const balance = await efiProvider.getAccountBalance();
            console.log('Balance check successful:', JSON.stringify(balance, null, 2));
        }
        catch (error) {
            console.warn('Balance check failed (might be expected if permission missing):', error.message);
        }
        const pixKey = process.env.EFI_PIX_KEY;
        if (!pixKey) {
            throw new Error('EFI_PIX_KEY is missing in .env');
        }
        const config = {
            pix: {
                receberSemChave: true,
                chaves: {
                    [pixKey]: {
                        recebimento: {
                            txidObrigatorio: false,
                            qrCodeEstatico: {
                                recusarTodos: false,
                            },
                            webhook: {
                                notificacao: {
                                    tarifa: true,
                                    pagador: true,
                                },
                            },
                        },
                    },
                },
            },
        };
        console.log('Updating Account Config (Payer Data)...');
        const response = await efiProvider.updateConfig(config);
        console.log('Configuration updated successfully:', JSON.stringify(response, null, 2));
        const domain = process.env.DOMAIN || 'swaptune.me';
        const webhookUrl = `https://api.${domain}/webhooks/efi/pix`;
        console.log(`Registering webhook URL: ${webhookUrl} for key: ${pixKey}`);
        const webhookResponse = await efiProvider.registerWebhook(pixKey, webhookUrl);
        console.log('Webhook registered successfully:', JSON.stringify(webhookResponse, null, 2));
    }
    catch (error) {
        console.error('Failed to update configuration:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=configure-efi.js.map