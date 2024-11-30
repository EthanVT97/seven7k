import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addMessage, updateMessageStatus } from '../store/slices/messageSlice';
import { addNotification } from '../store/slices/uiSlice';

export class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;
    private userId: string | null = null;

    private constructor() {
        // Private constructor to enforce singleton
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    connect(userId: string, token: string) {
        if (this.socket?.connected) {
            return;
        }

        this.userId = userId;
        this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            if (this.userId) {
                this.socket!.emit('join', this.userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            store.dispatch(
                addNotification({
                    type: 'error',
                    message: 'Lost connection to server. Attempting to reconnect...',
                })
            );
        });

        this.socket.on('reconnect', () => {
            console.log('Reconnected to WebSocket server');
            if (this.userId) {
                this.socket!.emit('join', this.userId);
            }
            store.dispatch(
                addNotification({
                    type: 'success',
                    message: 'Reconnected to server',
                })
            );
        });

        // Message events
        this.socket.on('receive_message', (message) => {
            store.dispatch(addMessage(message));

            // Show notification if message is from someone else
            if (message.sender._id !== this.userId) {
                const notification = new Notification('New Message', {
                    body: `${message.sender.name}: ${message.content}`,
                    icon: '/logo192.png',
                });

                notification.onclick = () => {
                    window.focus();
                    // Navigate to the chat - implement this based on your routing
                };
            }
        });

        this.socket.on('message_status', ({ messageId, status }) => {
            store.dispatch(updateMessageStatus({ messageId, status }));
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            store.dispatch(
                addNotification({
                    type: 'error',
                    message: 'Connection error. Please check your internet connection.',
                })
            );
        });
    }

    sendMessage(message: any) {
        if (!this.socket?.connected) {
            store.dispatch(
                addNotification({
                    type: 'error',
                    message: 'Not connected to server. Message will be sent when connection is restored.',
                })
            );
            return;
        }

        this.socket.emit('new_message', message);
    }

    updateMessageStatus(messageId: string, status: string) {
        if (this.socket?.connected) {
            this.socket.emit('message_status', { messageId, status });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.userId = null;
        }
    }
}
