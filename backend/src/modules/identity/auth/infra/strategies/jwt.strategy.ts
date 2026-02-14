import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        console.log(`[JwtStrategy] Initialized with Secret prefix: ${process.env.JWT_SECRET.substring(0, 4)}***`);

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['access_token'];
                    }

                    // DEBUG: Check Secret and Token Details per request
                    const secretPrefix = process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 4) : 'UNDEFINED';

                    if (token) {
                        try {
                            const [header, payload, signature] = token.split('.');
                            const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
                            const expDate = new Date(decodedPayload.exp * 1000);
                            const isExpired = expDate < new Date();

                            console.log(`[JwtDebug] Token Analysis:
                            - Secret Prefix: ${secretPrefix}***
                            - User ID (sub): ${decodedPayload.sub}
                            - Expiration: ${expDate.toISOString()} (Expired: ${isExpired})
                            - Signature End: ...${signature.slice(-6)}`);
                        } catch (e) {
                            console.error('[JwtDebug] Failed to decode token analysis:', e.message);
                        }
                    } else {
                        console.log(`[JwtDebug] No token found in cookies. Secret Prefix: ${secretPrefix}***`);
                    }

                    return token;
                },
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        console.log(`[JwtStrategy] Validate payload: ${JSON.stringify(payload)}`);
        return { id: payload.sub, email: payload.email };
    }
}
