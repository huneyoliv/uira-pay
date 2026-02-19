export declare abstract class ITokenProvider {
    abstract sign(payload: object, options?: {
        expiresIn?: string;
    }): string;
}
