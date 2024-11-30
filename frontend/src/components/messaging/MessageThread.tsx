import React, { useEffect, useRef } from 'react';
import { formatDate } from '../../utils/format';
import { Message } from '../../types/message';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MessageBubble } from '../Chat/MessageBubble';

interface MessageThreadProps {
    messages: Message[];
    loading?: boolean;
}

interface MessageGroup {
    date: Date;
    messages: Message[];
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages, loading }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useSelector((state: RootState) => state.auth);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach(message => {
            const date = new Date(message.timestamp || message.createdAt || '');
            const dateKey = date.toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
        });

        return Object.entries(groups).map(([dateStr, messages]) => ({
            date: new Date(dateStr),
            messages
        }));
    };

    const messageGroups = groupMessagesByDate(messages);

    if (loading) {
        return <div className="flex-1 p-4">Loading messages...</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {messageGroups.map((group, groupIndex) => (
                <div key={group.date.toISOString()} className="mb-6">
                    <div className="text-center mb-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            {formatDate(group.date)}
                        </span>
                    </div>
                    <div className="space-y-4">
                        {group.messages.map((message, messageIndex) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isTyping={false}
                            />
                        ))}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageThread; 