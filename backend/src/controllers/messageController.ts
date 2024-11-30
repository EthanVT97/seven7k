import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { Message, IMessage } from '../models/Message';
import { IUser } from '../models/User';
import { Types } from 'mongoose';
import { CacheService } from '../services/CacheService';

interface AuthRequest extends Request {
    user?: IUser & { _id: Types.ObjectId };
}

interface PaginationQuery {
    page?: string;
    limit?: string;
}

const cacheService = new CacheService();

export const getMessages = async (
    req: AuthRequest & { query: PaginationQuery },
    res: Response,
    next: NextFunction
) => {
    try {
        const page = parseInt(req.query.page || '1');
        const limit = parseInt(req.query.limit || '20');
        const skip = (page - 1) * limit;

        const cacheKey = `messages:${req.user?._id}:${page}:${limit}`;
        const cachedMessages = await cacheService.get<IMessage[]>(cacheKey);

        if (cachedMessages) {
            return res.json({
                messages: cachedMessages,
                page,
                limit,
                fromCache: true
            });
        }

        const messages = await Message.find({ sender: req.user?._id })
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
    } catch (err) {
        next(err);
    }
};

export const sendMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, recipientId, platform, attachments } = req.body;

        const message = new Message({
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
    } catch (err) {
        next(err);
    }
};

export const updateMessageStatus = async (req: Request, res: Response) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        message.status = status;
        await message.save();

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update message status' });
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!._id;

        const conversations = await Message.aggregate([
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
    } catch (error) {
        res.status(500).json({ error: 'Failed to get conversations' });
    }
}; 