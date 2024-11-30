export interface User {
    id: string;
    name?: string;
    avatar?: string;
}

export interface Message {
    id: string;
    content: string;
    sender: string | User;
    recipient?: string | User;
    timestamp?: string;
    createdAt?: string;
    status?: 'sent' | 'delivered' | 'read' | 'unread';
    platform: string;
    attachments?: {
        type: 'image' | 'video' | 'audio' | 'file';
        url: string;
        name?: string;
    }[];
}

export interface MessageState {
    messages: Message[];
    activeChat: string | null;
    loading: boolean;
    error: string | null;
}
