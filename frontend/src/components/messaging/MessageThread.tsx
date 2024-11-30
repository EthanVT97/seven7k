import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Message } from '../../types/message';

interface MessageThreadProps {
    messages: Message[];
    loading: boolean;
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

    const getMessageStatus = (status: string | undefined) => {
        switch (status) {
            case 'sent':
                return <CheckIcon className="h-4 w-4 text-gray-400" />;
            case 'delivered':
                return (
                    <div className="flex">
                        <CheckIcon className="h-4 w-4 text-blue-500" />
                        <CheckIcon className="h-4 w-4 -ml-2 text-blue-500" />
                    </div>
                );
            case 'read':
                return (
                    <div className="flex">
                        <CheckIcon className="h-4 w-4 text-green-500" />
                        <CheckIcon className="h-4 w-4 -ml-2 text-green-500" />
                    </div>
                );
            default:
                return null;
        }
    };

    const getDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const groupMessagesByDate = (messages: Message[]): MessageGroup[] => {
        const groups: MessageGroup[] = [];
        let currentGroup: MessageGroup | null = null;

        messages.forEach(message => {
            const messageDate = new Date(message.timestamp || message.createdAt || new Date());

            if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    date: messageDate,
                    messages: [message]
                };
            } else {
                currentGroup.messages.push(message);
            }
        });

        if (currentGroup) {
            groups.push(currentGroup);
        }

        return groups;
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messageGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                    <div className="flex justify-center">
                        <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                            {getDateLabel(group.date)}
                        </span>
                    </div>
                    {group.messages.map((message) => {
                        const isOwnMessage = typeof message.sender === 'string'
                            ? message.sender === user?.id
                            : message.sender.id === user?.id;

                        return (
                            <div
                                key={message.id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isOwnMessage
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    <p className="break-words">{message.content}</p>
                                    <div className="flex items-center justify-end space-x-1 mt-1">
                                        <span className="text-xs opacity-75">
                                            {format(new Date(message.timestamp || message.createdAt || new Date()), 'HH:mm')}
                                        </span>
                                        {isOwnMessage && getMessageStatus(message.status)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageThread; 