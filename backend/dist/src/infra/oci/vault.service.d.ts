export declare class VaultService {
    private readonly logger;
    private secretsClient;
    constructor();
    loadSecrets(): Promise<void>;
}
