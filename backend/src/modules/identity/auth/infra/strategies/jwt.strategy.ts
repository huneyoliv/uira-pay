import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../../../../infra/database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly prisma: PrismaService) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }


        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['access_token'];
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
        // console.log(`[JwtStrategy] Validate payload: ${JSON.stringify(payload)}`);
        const user = await this.prisma.tenant.findUnique({ where: { id: payload.sub } });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (payload.tokenVersion !== user.tokenVersion) {
            console.log(`[JwtStrategy] Token version mismatch. Payload: ${payload.tokenVersion}, User: ${user.tokenVersion}`);
            throw new UnauthorizedException('Token revoked');
        }

        return { id: payload.sub, email: payload.email };
    }
}
