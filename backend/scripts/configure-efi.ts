import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { EfiGatewayProvider } from '../src/modules/payment-fiat/providers/efi-gateway.provider';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const efiProvider = app.get(EfiGatewayProvider);
    console.log('Configuring Efí Webhook settings...');

    try {
        // 0. Test Connectivity/Permissions (Balance)
        try {
            console.log('Testing connection (Get Balance)...');
            const balance = await efiProvider.getAccountBalance();
            console.log('Balance check successful:', JSON.stringify(balance, null, 2));
        } catch (error: any) {
            console.warn('Balance check failed (might be expected if permission missing):', error.message);
        }

        // 1. Enable Payer Data
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

        // 2. Register Webhook URL
        const domain = process.env.DOMAIN;
        if (!domain) {
            throw new Error('DOMAIN is missing in .env');
        }
        const webhookUrl = `https://api.${domain}/webhooks/efi/pix`;

        console.log(`Registering webhook URL: ${webhookUrl} for key: ${pixKey}`);
        const webhookResponse = await efiProvider.registerWebhook(pixKey, webhookUrl);
        console.log('Webhook registered successfully:', JSON.stringify(webhookResponse, null, 2));

    } catch (error) {
        console.error('Failed to update configuration:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
