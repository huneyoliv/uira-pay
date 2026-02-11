export abstract class IPasswordHasher {
    abstract hash(password: string): Promise<string>;
    abstract compare(plain: string, hashed: string): Promise<boolean>;
}
