import { IPasswordHasher } from '../domain/password.hasher.interface';
export declare class BcryptHasher implements IPasswordHasher {
    private readonly SALT_ROUNDS;
    hash(password: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}
