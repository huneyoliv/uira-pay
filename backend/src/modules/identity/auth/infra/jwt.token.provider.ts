import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenProvider } from '../domain/token.provider.interface';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
    constructor(private readonly jwtService: JwtService) { }

    sign(payload: object): string {
        return this.jwtService.sign(payload);
    }
}
