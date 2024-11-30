import { body, ValidationChain } from 'express-validator';

export const messageValidation: ValidationChain[] = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content cannot be empty'),

    body('platform')
        .isIn(['whatsapp', 'telegram', 'facebook', 'line', 'viber'])
        .withMessage('Invalid platform specified'),

    body('recipientId')
        .notEmpty()
        .withMessage('Recipient ID is required'),

    body('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array'),

    body('attachments.*.type')
        .optional()
        .isIn(['image', 'video', 'audio', 'document'])
        .withMessage('Invalid attachment type'),

    body('attachments.*.url')
        .optional()
        .isURL()
        .withMessage('Invalid attachment URL')
]; 