"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageValidation = void 0;
const express_validator_1 = require("express-validator");
exports.messageValidation = [
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty()
        .withMessage('Message content cannot be empty'),
    (0, express_validator_1.body)('platform')
        .isIn(['whatsapp', 'telegram', 'facebook', 'line', 'viber'])
        .withMessage('Invalid platform specified'),
    (0, express_validator_1.body)('recipientId')
        .notEmpty()
        .withMessage('Recipient ID is required'),
    (0, express_validator_1.body)('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array'),
    (0, express_validator_1.body)('attachments.*.type')
        .optional()
        .isIn(['image', 'video', 'audio', 'document'])
        .withMessage('Invalid attachment type'),
    (0, express_validator_1.body)('attachments.*.url')
        .optional()
        .isURL()
        .withMessage('Invalid attachment URL')
];
