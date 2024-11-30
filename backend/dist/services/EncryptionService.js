"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 12; // 96 bits for GCM
        this.tagLength = 16; // 128 bits
        const key = process.env.ENCRYPTION_KEY;
        if (!key) {
            throw new Error('Encryption key not configured');
        }
        // Derive a key using PBKDF2
        this.encryptionKey = crypto_1.default.pbkdf2Sync(key, 'salt', // In production, use a proper salt
        100000, // Number of iterations
        this.keyLength, 'sha256');
    }
    /**
     * Encrypts a message using AES-256-GCM
     * @param plaintext The message to encrypt
     * @returns Object containing the encrypted message, IV, and auth tag
     */
    encrypt(plaintext) {
        const iv = crypto_1.default.randomBytes(this.ivLength);
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.encryptionKey, iv);
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
    decrypt(encryptedData, iv, authTag) {
        try {
            const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.encryptionKey, Buffer.from(iv, 'base64'));
            decipher.setAuthTag(Buffer.from(authTag, 'base64'));
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            throw new Error('Failed to decrypt message: Invalid data or key');
        }
    }
    /**
     * Generates a new encryption key
     * @returns A new random encryption key
     */
    static generateKey() {
        return crypto_1.default.randomBytes(32).toString('base64');
    }
}
exports.EncryptionService = EncryptionService;
