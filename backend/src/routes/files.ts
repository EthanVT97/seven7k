import express from 'express';
import { FileController } from '../controllers/fileController';
import { auth } from '../middleware/auth';
import { RateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const fileController = new FileController();

// Rate limiters for file operations
const uploadLimiter = RateLimiter.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 uploads per 15 minutes
    keyPrefix: 'upload:'
});

const downloadLimiter = RateLimiter.createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 downloads per minute
    keyPrefix: 'download:'
});

// All routes require authentication
router.use(auth);

// Get pre-signed URL for upload
router.post('/upload-url', uploadLimiter, fileController.getUploadUrl.bind(fileController));

// Delete a file
router.delete('/:key', uploadLimiter, fileController.deleteFile.bind(fileController));

// Get file metadata
router.get('/:key/metadata', downloadLimiter, fileController.getFileMetadata.bind(fileController));

// Get public URL
router.get('/:key/url', downloadLimiter, fileController.getPublicUrl.bind(fileController));

export default router; 