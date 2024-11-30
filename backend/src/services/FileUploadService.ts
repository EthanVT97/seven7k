import { S3Client, PutObjectCommand, DeleteObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import mime from 'mime-types';

interface UploadedFile {
    url: string;
    key: string;
    contentType: string;
    size: number;
}

interface ExtendedPutObjectCommandOutput extends PutObjectCommandOutput {
    ContentType?: string;
    ContentLength?: number;
}

export class FileUploadService {
    private s3Client: S3Client;
    private bucket: string;
    private cdnBaseUrl: string;
    private allowedTypes: string[];
    private maxFileSize: number;

    constructor() {
        this.s3Client = new S3Client({
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
    validateFile(contentType: string, size: number): void {
        if (!this.isAllowedType(contentType)) {
            throw new Error(`File type ${contentType} is not allowed`);
        }

        if (size > this.maxFileSize) {
            throw new Error(
                `File size ${size} exceeds maximum allowed size of ${this.maxFileSize}`
            );
        }
    }

    /**
     * Generates a pre-signed URL for direct upload to S3
     */
    async getPresignedUploadUrl(
        filename: string,
        contentType: string
    ): Promise<{ url: string; key: string; fields: Record<string, string> }> {
        const key = this.generateKey(filename);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

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
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    /**
     * Gets the public URL for a file
     */
    getPublicUrl(key: string): string {
        return `${this.cdnBaseUrl}/${key}`;
    }

    /**
     * Generates a unique key for the file
     */
    private generateKey(filename: string): string {
        const ext = filename.split('.').pop() || '';
        const hash = crypto.randomBytes(16).toString('hex');
        const date = new Date().toISOString().split('T')[0];
        return `uploads/${date}/${hash}.${ext}`;
    }

    /**
     * Checks if the file type is allowed
     */
    private isAllowedType(contentType: string): boolean {
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
    async getFileMetadata(key: string): Promise<{
        contentType: string;
        size: number;
    }> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const response = (await this.s3Client.send(command)) as ExtendedPutObjectCommandOutput;
        const mimeType = mime.lookup(key);

        return {
            contentType: response.ContentType || (mimeType ? mimeType.toString() : 'application/octet-stream'),
            size: response.ContentLength || 0,
        };
    }
} 