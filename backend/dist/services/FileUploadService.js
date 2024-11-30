"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto_1 = __importDefault(require("crypto"));
const mime_types_1 = __importDefault(require("mime-types"));
class FileUploadService {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.CDN_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.CDN_ACCESS_KEY || '',
                secretAccessKey: process.env.CDN_SECRET_KEY || '',
            },
        });
        this.bucket = process.env.CDN_BUCKET_NAME || '';
        this.cdnBaseUrl = process.env.CDN_BASE_URL || '';
        this.allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default
    }
    /**
     * Validates file metadata before upload
     */
    validateFile(contentType, size) {
        if (!this.isAllowedType(contentType)) {
            throw new Error(`File type ${contentType} is not allowed`);
        }
        if (size > this.maxFileSize) {
            throw new Error(`File size ${size} exceeds maximum allowed size of ${this.maxFileSize}`);
        }
    }
    /**
     * Generates a pre-signed URL for direct upload to S3
     */
    async getPresignedUploadUrl(filename, contentType) {
        const key = this.generateKey(filename);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
        return {
            url,
            key,
            fields: {
                'Content-Type': contentType,
            },
        };
    }
    /**
     * Deletes a file from S3
     */
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await this.s3Client.send(command);
    }
    /**
     * Gets the public URL for a file
     */
    getPublicUrl(key) {
        return `${this.cdnBaseUrl}/${key}`;
    }
    /**
     * Generates a unique key for the file
     */
    generateKey(filename) {
        const ext = filename.split('.').pop() || '';
        const hash = crypto_1.default.randomBytes(16).toString('hex');
        const date = new Date().toISOString().split('T')[0];
        return `uploads/${date}/${hash}.${ext}`;
    }
    /**
     * Checks if the file type is allowed
     */
    isAllowedType(contentType) {
        return this.allowedTypes.some((allowedType) => {
            if (allowedType.endsWith('/*')) {
                const type = allowedType.replace('/*', '');
                return contentType.startsWith(type + '/');
            }
            return contentType === allowedType;
        });
    }
    /**
     * Gets file metadata
     */
    async getFileMetadata(key) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = (await this.s3Client.send(command));
        const mimeType = mime_types_1.default.lookup(key);
        return {
            contentType: response.ContentType || (mimeType ? mimeType.toString() : 'application/octet-stream'),
            size: response.ContentLength || 0,
        };
    }
}
exports.FileUploadService = FileUploadService;
