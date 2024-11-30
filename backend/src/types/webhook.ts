export interface WebhookData {
    platform: 'whatsapp' | 'facebook' | 'telegram' | 'line' | 'viber';
    data: WhatsAppMessage | FacebookMessage | TelegramMessage | LineEvent | ViberMessage;
}

export interface WhatsAppMessage {
    from: string;
    id: string;
    timestamp: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document';
    text?: {
        body: string;
    };
    image?: {
        id: string;
        mime_type: string;
        sha256: string;
    };
}

export interface FacebookMessage {
    sender: {
        id: string;
    };
    recipient: {
        id: string;
    };
    timestamp: number;
    message: {
        mid: string;
        text?: string;
        attachments?: Array<{
            type: string;
            payload: {
                url: string;
            };
        }>;
    };
}

export interface TelegramMessage {
    message_id: number;
    from: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
    };
    chat: {
        id: number;
        type: string;
    };
    date: number;
    text?: string;
    photo?: Array<{
        file_id: string;
        file_unique_id: string;
        file_size: number;
        width: number;
        height: number;
    }>;
}

export interface LineEvent {
    type: 'message' | 'follow' | 'unfollow' | 'join' | 'leave';
    message?: {
        type: string;
        id: string;
        text?: string;
    };
    timestamp: number;
    source: {
        type: 'user' | 'group' | 'room';
        userId: string;
    };
    replyToken: string;
}

export interface ViberMessage {
    event: string;
    timestamp: number;
    message_token: number;
    sender: {
        id: string;
        name: string;
        avatar?: string;
    };
    message: {
        type: string;
        text?: string;
        media?: string;
        file_name?: string;
        size?: number;
    };
} 