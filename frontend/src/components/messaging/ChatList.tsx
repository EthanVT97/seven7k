import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { format } from 'date-fns';
import { Message, MessageState } from '../../types/message';

interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    platform: string;
}

const ChatList: React.FC = () => {
    const { messages, activeChat } = useSelector((state: RootState) => state.messages);
    const [searchQuery, setSearchQuery] = useState('');

    const chats: Chat[] = messages.map((message: Message) => ({
        id: message.id,
        name: typeof message.sender === 'string' ? message.sender : message.sender.name || 'Unknown',
        lastMessage: message.content,
        timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
        unreadCount: message.status === 'unread' ? 1 : 0,
        platform: message.platform
    }));

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.platform.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search chats..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                        No chats found
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${activeChat === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 dark:text-white">{chat.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                        {chat.lastMessage}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(chat.timestamp), 'HH:mm')}
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                    {chat.platform}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;