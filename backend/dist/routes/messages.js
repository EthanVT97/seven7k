"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.auth);
// Message routes
router.post('/', messageController_1.sendMessage);
router.get('/', messageController_1.getMessages);
router.patch('/:messageId/status', messageController_1.updateMessageStatus);
router.get('/conversations', messageController_1.getConversations);
exports.default = router;
