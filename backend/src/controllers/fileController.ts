import { Request, Response } from 'express';
import { FileUploadService } from '../services/FileUploadService';

export class FileController {
    private fileUploadService: FileUploadService;

    constructor() {
        this.fileUploadService = new FileUploadService();
    }

    /**
     * Get a pre-signed URL for file upload
     */
    async getUploadUrl(req: Request, res: Response) {
        try {
            const { filename, contentType, size } = req.body;

            if (!filename || !contentType || !size) {
                return res.status(400).json({
                    error: 'Missing required fields: filename, contentType, size'
                });
            }

            // Validate file metadata
            try {
                this.fileUploadService.validateFile(contentType, size);
            } catch (error: any) {
                return res.status(400).json({ error: error.message });
            }

            const uploadData = await this.fileUploadService.getPresignedUploadUrl(
                filename,
                contentType
            );

            res.json(uploadData);
        } catch (error: any) {
            console.error('Error generating upload URL:', error);
            res.status(500).json({ error: 'Failed to generate upload URL' });
        }
    }

    /**
     * Delete a file
     */
    async deleteFile(req: Request, res: Response) {
        try {
            const { key } = req.params;

            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }

            await this.fileUploadService.deleteFile(key);
            res.sendStatus(204);
        } catch (error: any) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(req: Request, res: Response) {
        try {
            const { key } = req.params;

            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }

            const metadata = await this.fileUploadService.getFileMetadata(key);
            res.json(metadata);
        } catch (error: any) {
            console.error('Error getting file metadata:', error);
            res.status(500).json({ error: 'Failed to get file metadata' });
        }
    }

    /**
     * Get public URL for a file
     */
    getPublicUrl(req: Request, res: Response) {
        try {
            const { key } = req.params;

            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }

            const url = this.fileUploadService.getPublicUrl(key);
            res.json({ url });
        } catch (error: any) {
            console.error('Error getting public URL:', error);
            res.status(500).json({ error: 'Failed to get public URL' });
        }
    }
} 