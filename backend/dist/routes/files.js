"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fileController_1 = require("../controllers/fileController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
const fileController = new fileController_1.FileController();
// Rate limiters for file operations
const uploadLimiter = rateLimiter_1.RateLimiter.createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 uploads per 15 minutes
    keyPrefix: 'upload:'
});
const downloadLimiter = rateLimiter_1.RateLimiter.createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 downloads per minute
    keyPrefix: 'download:'
});
// All routes require authentication
router.use(auth_1.auth);
// Get pre-signed URL for upload
router.post('/upload-url', uploadLimiter, fileController.getUploadUrl.bind(fileController));
// Delete a file
router.delete('/:key', uploadLimiter, fileController.deleteFile.bind(fileController));
// Get file metadata
router.get('/:key/metadata', downloadLimiter, fileController.getFileMetadata.bind(fileController));
// Get public URL
router.get('/:key/url', downloadLimiter, fileController.getPublicUrl.bind(fileController));
exports.default = router;
