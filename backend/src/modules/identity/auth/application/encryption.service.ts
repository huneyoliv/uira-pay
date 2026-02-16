import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly algorithm = 'aes-256-cbc';

    private getKey(): Buffer {
        const keyHex = process.env.OCI_SECRET_TWO_FACTOR_ENCRYPTION_KEY || process.env.TWO_FACTOR_ENCRYPTION_KEY;
        if (!keyHex) {
            throw new Error('Encryption key not configured (OCI_SECRET_TWO_FACTOR_ENCRYPTION_KEY)');
        }
        // Ensure key is 32 bytes
        return Buffer.from(keyHex, 'hex');
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
