import crypto from 'crypto';

export class EncryptionService {
    private algorithm: string = 'aes-256-gcm';
    private keyLength: number = 32; // 256 bits
    private ivLength: number = 12; // 96 bits for GCM
    private tagLength: number = 16; // 128 bits
    private encryptionKey: Buffer;

    constructor() {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) {
            throw new Error('Encryption key not configured');
        }
        // Derive a key using PBKDF2
        this.encryptionKey = crypto.pbkdf2Sync(
            key,
            'salt', // In production, use a proper salt
            100000, // Number of iterations
            this.keyLength,
            'sha256'
        );
    }

    /**
     * Encrypts a message using AES-256-GCM
     * @param plaintext The message to encrypt
     * @returns Object containing the encrypted message, IV, and auth tag
     */
    encrypt(plaintext: string): {
        encryptedData: string;
        iv: string;
        authTag: string;
    } {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(
            this.algorithm,
            this.encryptionKey,
            iv
        ) as crypto.CipherGCM;

        let encryptedData = cipher.update(plaintext, 'utf8', 'base64');
        encryptedData += cipher.final('base64');
        const authTag = cipher.getAuthTag();

        return {
            encryptedData,
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
        };
    }

    /**
     * Decrypts a message using AES-256-GCM
     * @param encryptedData The encrypted message
     * @param iv The initialization vector used for encryption
     * @param authTag The authentication tag
     * @returns The decrypted message
     */
    decrypt(
        encryptedData: string,
        iv: string,
        authTag: string
    ): string {
        try {
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.encryptionKey,
                Buffer.from(iv, 'base64')
            ) as crypto.DecipherGCM;

            decipher.setAuthTag(Buffer.from(authTag, 'base64'));

            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error('Failed to decrypt message: Invalid data or key');
        }
    }

    /**
     * Generates a new encryption key
     * @returns A new random encryption key
     */
    static generateKey(): string {
        return crypto.randomBytes(32).toString('base64');
    }
} 