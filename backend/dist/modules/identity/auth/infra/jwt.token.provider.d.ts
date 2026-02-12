import { JwtService } from '@nestjs/jwt';
import { ITokenProvider } from '../domain/token.provider.interface';
export declare class JwtTokenProvider implements ITokenProvider {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    sign(payload: object): string;
}
