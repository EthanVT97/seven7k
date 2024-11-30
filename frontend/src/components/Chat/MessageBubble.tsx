import React from 'react';
import { Message } from '../../types/message';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { TypingIndicator } from './TypingIndicator';

interface MessageBubbleProps {
    message: Message;
    isTyping?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping }) => {
    // Determine if message is from user based on sender info instead of role
    const isUser = typeof message.sender === 'string'
        ? false // If sender is a string ID, it's not the user
        : message.sender.id === 'current_user_id'; // Replace with actual user ID check
    const sanitizedHtml = DOMPurify.sanitize(marked.parse(message.content).toString());

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            data-testid="message-bubble"
        >
            <div
                className={`
                    max-w-[80%] rounded-lg px-4 py-2
                    ${isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }
                `}
            >
                {isTyping ? (
                    <TypingIndicator />
                ) : (
                    <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                )}
                <div className={`text-xs mt-1 ${isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp || message.createdAt || '').toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}; 