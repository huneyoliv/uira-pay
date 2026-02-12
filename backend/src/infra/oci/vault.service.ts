import { Injectable, Logger } from '@nestjs/common';
import * as common from 'oci-common';
import * as secrets from 'oci-secrets';

@Injectable()
export class VaultService {
    private readonly logger = new Logger(VaultService.name);
    private secretsClient: secrets.SecretsClient;

    constructor() { }

    /**
     * Scans process.env for OCI_SECRET_* variables and fetches their values.
     * Updates process.env with the actual values.
     */
    async loadSecrets(): Promise<void> {
        const secretVars = Object.keys(process.env).filter(key => key.startsWith('OCI_SECRET_'));

        if (secretVars.length === 0) {
            this.logger.log('No OCI_SECRET_* environment variables found. Skipping Vault fetch.');
            return;
        }

        this.logger.log(`Found ${secretVars.length} OCI secrets to fetch...`);

        // Initialize OCI SDK (Async)
        if (!this.secretsClient) {
            try {
                let provider: common.AuthenticationDetailsProvider;

                if (process.env.OCI_AUTH_METHOD === 'config_file') {
                    this.logger.log('Using OCI Config File Authentication (Local Dev)');
                    provider = new common.ConfigFileAuthenticationDetailsProvider();
                } else {
                    this.logger.log('Using OCI Instance Principals Authentication');
                    provider = await new common.InstancePrincipalsAuthenticationDetailsProviderBuilder().build();
                }

                this.secretsClient = new secrets.SecretsClient({ authenticationDetailsProvider: provider });
            } catch (error) {
                this.logger.warn('Failed to initialize OCI Auth Provider. Vault integration disabled. ' + error.message);
                return;
            }
        }

        for (const envVar of secretVars) {
            const secretOcid = process.env[envVar];
            const targetVar = envVar.replace('OCI_SECRET_', '');

            if (!secretOcid) continue;

            try {
                const req: secrets.requests.GetSecretBundleRequest = {
                    secretId: secretOcid,
                    stage: secrets.requests.GetSecretBundleRequest.Stage.Current
                };

                const response = await this.secretsClient.getSecretBundle(req);
                const secretBundleContent = response.secretBundle.secretBundleContent;

                if (!secretBundleContent) {
                    this.logger.warn(`Secret ${envVar} has no content.`);
                    continue;
                }

                if (secretBundleContent.contentType === 'BASE64') {
                    const content = (secretBundleContent as secrets.models.Base64SecretBundleContentDetails).content;
                    if (content) {
                        const buff = Buffer.from(content, 'base64');
                        const secretValue = buff.toString('utf-8');

                        // Inject into process.env so ConfigService picks it up
                        process.env[targetVar] = secretValue;
                        this.logger.log(`Secret loaded: ${targetVar} (from ${envVar})`);
                    }
                } else {
                    this.logger.warn(`Secret ${envVar} format not supported (contentType: ${secretBundleContent.contentType})`);
                }
            } catch (error) {
                this.logger.error(`Failed to fetch secret ${envVar} (${secretOcid})`, error);
                // Don't crash, maybe local fallback exists
            }
        }
    }
}
