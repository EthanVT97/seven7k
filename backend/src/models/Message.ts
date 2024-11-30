import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    recipient: string;
    content: string;
    platform: 'whatsapp' | 'facebook' | 'telegram' | 'line' | 'viber';
    status: 'sent' | 'delivered' | 'read';
    metadata: {
        platformMessageId?: string;
        attachments?: Array<{
            type: string;
            url: string;
        }>;
        replyTo?: mongoose.Types.ObjectId;
    };
}

const messageSchema = new Schema<IMessage>(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            enum: ['whatsapp', 'facebook', 'telegram', 'line', 'viber'],
            required: true,
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
        },
        metadata: {
            platformMessageId: String,
            attachments: [
                {
                    type: {
                        type: String,
                        enum: ['image', 'video', 'audio', 'document'],
                    },
                    url: String,
                },
            ],
            replyTo: {
                type: Schema.Types.ObjectId,
                ref: 'Message',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ platform: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema); 