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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const prisma_service_1 = require("../../../../../infra/database/prisma.service");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    logger = new common_1.Logger(JwtStrategy_1.name);
    constructor(prisma) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is not defined');
        }
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
                (req) => {
                    let token = null;
                    if (req && req.cookies) {
                        token = req.cookies['access_token'];
                    }
                    return token;
                },
                passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
        this.prisma = prisma;
    }
    async validate(payload) {
        const user = await this.prisma.tenant.findUnique({ where: { id: payload.sub } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (payload.tokenVersion !== user.tokenVersion) {
            this.logger.warn(`Token version mismatch for user ${payload.sub}`);
            throw new common_1.UnauthorizedException('Token revoked');
        }
        if (user.blockedAt) {
            this.logger.warn(`Blocked account attempted access: ${payload.sub}`);
            throw new common_1.UnauthorizedException('Account is blocked');
        }
        return { id: payload.sub, email: payload.email };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map