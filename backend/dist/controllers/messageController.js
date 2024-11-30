"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = exports.updateMessageStatus = exports.sendMessage = exports.getMessages = void 0;
const express_validator_1 = require("express-validator");
const Message_1 = require("../models/Message");
const CacheService_1 = require("../services/CacheService");
const cacheService = new CacheService_1.CacheService();
const getMessages = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;
        const cacheKey = `messages:${req.user?._id}:${page}:${limit}`;
        const cachedMessages = await cacheService.get(cacheKey);
        if (cachedMessages) {
            return res.json({
                messages: cachedMessages,
                page,
                limit,
                fromCache: true
            });
        }
        const messages = await Message_1.Message.find({ sender: req.user?._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('recipient', 'name avatar');
        await cacheService.set(cacheKey, messages, 300); // Cache for 5 minutes
        res.json({
            messages,
            page,
            limit,
            fromCache: false
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { content, recipientId, platform, attachments } = req.body;
        const message = new Message_1.Message({
            content,
            sender: req.user?._id,
            recipient: recipientId,
            platform,
            attachments
        });
        await message.save();
        // Clear cache for both sender and recipient
        await cacheService.deletePattern(`messages:${req.user?._id}:*`);
        await cacheService.deletePattern(`messages:${recipientId}:*`);
        // Populate recipient details
        await message.populate('recipient', 'name avatar');
        res.status(201).json(message);
    }
    catch (err) {
        next(err);
    }
};
exports.sendMessage = sendMessage;
const updateMessageStatus = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;
        const message = await Message_1.Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        message.status = status;
        await message.save();
        res.json(message);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update message status' });
    }
};
exports.updateMessageStatus = updateMessageStatus;
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversations = await Message_1.Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userId },
                        { recipient: userId.toString() }
                    ],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', userId] },
                            '$recipient',
                            '$sender',
                        ],
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$sender', userId] },
                                        { $ne: ['$status', 'read'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $sort: { 'lastMessage.createdAt': -1 },
            },
        ]);
        res.json(conversations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get conversations' });
    }
};
exports.getConversations = getConversations;
