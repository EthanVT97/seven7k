"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const FileUploadService_1 = require("../services/FileUploadService");
class FileController {
    constructor() {
        this.fileUploadService = new FileUploadService_1.FileUploadService();
    }
    /**
     * Get a pre-signed URL for file upload
     */
    async getUploadUrl(req, res) {
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
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
            const uploadData = await this.fileUploadService.getPresignedUploadUrl(filename, contentType);
            res.json(uploadData);
        }
        catch (error) {
            console.error('Error generating upload URL:', error);
            res.status(500).json({ error: 'Failed to generate upload URL' });
        }
    }
    /**
     * Delete a file
     */
    async deleteFile(req, res) {
        try {
            const { key } = req.params;
            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }
            await this.fileUploadService.deleteFile(key);
            res.sendStatus(204);
        }
        catch (error) {
            console.error('Error deleting file:', error);
            res.status(500).json({ error: 'Failed to delete file' });
        }
    }
    /**
     * Get file metadata
     */
    async getFileMetadata(req, res) {
        try {
            const { key } = req.params;
            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }
            const metadata = await this.fileUploadService.getFileMetadata(key);
            res.json(metadata);
        }
        catch (error) {
            console.error('Error getting file metadata:', error);
            res.status(500).json({ error: 'Failed to get file metadata' });
        }
    }
    /**
     * Get public URL for a file
     */
    getPublicUrl(req, res) {
        try {
            const { key } = req.params;
            if (!key) {
                return res.status(400).json({ error: 'File key is required' });
            }
            const url = this.fileUploadService.getPublicUrl(key);
            res.json({ url });
        }
        catch (error) {
            console.error('Error getting public URL:', error);
            res.status(500).json({ error: 'Failed to get public URL' });
        }
    }
}
exports.FileController = FileController;
