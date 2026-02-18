import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly algorithm = 'aes-256-cbc';
    private ephemeralKey: Buffer | null = null;

    private getKey(): Buffer {
        // Try resolved key first (VaultService strips OCI_SECRET_ prefix)
        const keyHex = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.OCI_SECRET_TWO_FACTOR_ENCRYPTION_KEY;

        if (keyHex) {
            // If it looks like an OCI OCID (not yet resolved), skip it
            if (keyHex.startsWith('ocid1.')) {
                this.logger.warn('TWO_FACTOR_ENCRYPTION_KEY is still an OCI OCID — VaultService may not have resolved it yet.');
            } else {
                try {
                    const buf = Buffer.from(keyHex, 'hex');
                    if (buf.length === 32) {
                        return buf;
                    }
                    // Key exists but wrong length — try SHA-256 hash to normalize
                    this.logger.warn(`Encryption key has ${buf.length} bytes instead of 32. Deriving 32-byte key via SHA-256.`);
                    return crypto.createHash('sha256').update(keyHex).digest();
                } catch (error) {
                    this.logger.warn('Failed to parse encryption key as hex. Deriving via SHA-256.', error.message);
                    return crypto.createHash('sha256').update(keyHex).digest();
                }
            }
        }

        // Fallback: generate ephemeral key (data encrypted with this key won't survive restarts)
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: TWO_FACTOR_ENCRYPTION_KEY is not configured. 2FA cannot function without a persistent encryption key.');
        }
        if (!this.ephemeralKey) {
            this.logger.warn('No encryption key configured. Generating ephemeral key. 2FA secrets will NOT persist across restarts!');
            this.ephemeralKey = crypto.randomBytes(32);
        }
        return this.ephemeralKey;
    }

    encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const key = this.getKey();
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text: string): string {
        const textParts = text.split(':');
        const ivHex = textParts.shift();
        if (!ivHex) throw new Error('Invalid encrypted text format');

        const iv = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');

        const key = this.getKey();
        const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
}
