import React, { useEffect, useState } from 'react';
import { Message } from '../../types/message';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { TypingIndicator } from './TypingIndicator';

interface MessageBubbleProps {
    message: Message;
    isTyping?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping }) => {
    const [sanitizedHtml, setSanitizedHtml] = useState('');
    const isUser = message.role === 'user';

    useEffect(() => {
        const parseContent = async () => {
            const parsedContent = await marked.parse(message.content);
            setSanitizedHtml(DOMPurify.sanitize(parsedContent));
        };
        parseContent();
    }, [message.content]);

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