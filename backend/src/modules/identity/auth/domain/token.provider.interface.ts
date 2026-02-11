export abstract class ITokenProvider {
    abstract sign(payload: object): string;
}
