import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ITokenProvider } from '../domain/token.provider.interface';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
    constructor(private readonly jwtService: JwtService) { }

    sign(payload: object, options?: { expiresIn?: string }): string {
        return this.jwtService.sign(payload as Record<string, unknown>, options as JwtSignOptions);
    }
}
