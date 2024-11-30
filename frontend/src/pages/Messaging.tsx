import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchMessages, sendMessage } from '../store/slices/messageSlice';
import { addNotification } from '../store/slices/uiSlice';
import ChatList from '../components/messaging/ChatList';
import MessageThread from '../components/messaging/MessageThread';
import PlatformSelector from '../components/messaging/PlatformSelector';

function Messaging(): React.ReactElement {
    const dispatch = useDispatch<AppDispatch>();
    const { messages, activeChat, loading } = useSelector((state: RootState) => state.messages);
    const [messageText, setMessageText] = React.useState('');

    React.useEffect(() => {
        if (activeChat) {
            void dispatch(fetchMessages(activeChat));
        }
    }, [activeChat, dispatch]);

    const handleSendMessage = async () => {
        if (!messageText.trim() || !activeChat) return;

        try {
            await dispatch(sendMessage({
                content: messageText,
                recipient: activeChat,
                platform: 'whatsapp',
            })).unwrap();
            setMessageText('');
        } catch (error) {
            dispatch(addNotification({
                type: 'error',
                message: 'Failed to send message',
            }));
        }
    };

    return (
        <div className="flex h-full">
            <div className="w-1/4 border-r border-gray-200 dark:border-gray-700">
                <ChatList />
            </div>

            <div className="flex-1 flex flex-col">
                {activeChat ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <PlatformSelector />
                        </div>
                        <MessageThread messages={messages} loading={loading} />
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    onKeyPress={(e) => e.key === 'Enter' && void handleSendMessage()}
                                />
                                <button
                                    onClick={() => void handleSendMessage()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messaging; 