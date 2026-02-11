import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EfiHmacGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const nodeEnv = this.configService.get('NODE_ENV');
        const EFI_OFFICIAL_IP = '34.193.116.226';

        // 1. mTLS Validation (Priority)
        // Check if the connection is authorized via Client Certificate
        // Note: This requires the Node.js server to be configured with 'requestCert: true' and CA trust store.
        const isMtlsAuthorized = (request.socket as any).authorized;

        if (isMtlsAuthorized) {
            // STRONG SECURITY: Client Certificate Verified by Node.js/TLS Layer
            // We can trust this request came from Efí.
        } else {
            // 2. Fallback: Strict IP + Token Validation
            // CRITICAL: If we are here, mTLS failed or is not available (e.g., Cloudflare/AWS ALB stripping certs).
            // We MUST ensure we don't accidentally allow spoofed requests.

            // A. IP Validation
            if (nodeEnv !== 'development') {
                const remoteIp = request.ip || request.headers['x-forwarded-for'] || request.socket.remoteAddress;
                // Note: In a real production behind proxy, trust-proxy must be enabled in main.ts
                const requestIps = Array.isArray(remoteIp) ? remoteIp : (remoteIp as string).split(',').map(ip => ip.trim());

                if (!requestIps.includes(EFI_OFFICIAL_IP)) {
                    console.warn(`[Security Block] Access Denied for IP: ${remoteIp}. Expected Efí: ${EFI_OFFICIAL_IP}`);
                    throw new UnauthorizedException('Access Denied: Unauthorized IP.');
                }
            }

            // B. URL HMAC Token Validation (?hmac=...)
            // This is a shared secret fallback.
            const sharedSecret = this.configService.get<string>('EFI_WEBHOOK_URL_SECRET');

            if (!sharedSecret) {
                // SECURITY HOLE FIX: Do NOT fail open. If we can't verify source via mTLS OR Token, we must block.
                console.error('[Configuration Error] EFI_WEBHOOK_URL_SECRET is missing. Cannot perform fallback validation.');
                throw new InternalServerErrorException('Security Configuration Error: Missing Webhook Fallback Secret.');
            }

            const hmacQuery = request.query.hmac;
            if (!hmacQuery || hmacQuery !== sharedSecret) {
                console.warn(`[Security Block] Invalid or Missing ?hmac= token. Received: ${hmacQuery}`);
                throw new UnauthorizedException('Access Denied: Invalid Authentication Token.');
            }
        }

        // 3. Headers Extraction for Standard Signature
        const signature = request.headers['x-ad-signature'] || request.headers['signature'];
        const timestamp = request.headers['x-request-timestamp'] || request.headers['request-timestamp'];
        const nonce = request.headers['x-nonce'] || request.headers['nonce'];

        // Raw Body is required. 'rawBody' property is added by NestJS if rawBody: true is set in main.ts
        const payload = request.rawBody;

        if (nodeEnv === 'development' && !signature) {
            console.warn('Webhook received without signature in DEV mode - Bypassing for testing.');
            return true;
        }

        if (!payload) {
            throw new InternalServerErrorException('Raw body not available. Check main.ts configuration.');
        }

        if (!signature) {
            throw new UnauthorizedException('Missing Webhook Signature.');
        }

        // 4. Replay Attack Protection (5 mins tolerance)
        if (timestamp) {
            const requestTime = parseInt(timestamp as string, 10);
            const now = Date.now();
            const tolerance = 5 * 60 * 1000;

            if (isNaN(requestTime) || Math.abs(now - requestTime) > tolerance) {
                throw new BadRequestException('Request timestamp expired or invalid.');
            }
        }

        // 5. Signature Validation
        const secret = this.configService.get<string>('EFI_WEBHOOK_SECRET');
        if (!secret) {
            console.error('EFI_WEBHOOK_SECRET is not defined');
            throw new InternalServerErrorException('Webhook secret not configured.');
        }

        const dataToSign = timestamp ? `${timestamp}${nonce || ''}${payload.toString()}` : payload.toString();

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex');

        // 6. Constant-Time Comparison
        const sigStr = (Array.isArray(signature) ? signature[0] : signature) as string;
        const signatureBuffer = Buffer.from(sigStr);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            console.warn(`[Security Alert] Invalid Webhook Signature from IP: ${request.ip}`);
            throw new UnauthorizedException('Invalid Signature.');
        }

        return true;
    }
}
