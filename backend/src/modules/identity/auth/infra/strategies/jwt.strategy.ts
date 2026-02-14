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
                    console.log(`[JwtStrategy] Extracted token from cookie: ${token ? 'YES' : 'NO'}`);
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
