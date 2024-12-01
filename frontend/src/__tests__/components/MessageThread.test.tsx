import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MessageThread from '../../components/messaging/MessageThread';
import { store } from '../../store/store';
import { Message } from '../../types/message';

const mockStore = configureStore([]);

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: mockScrollIntoView,
});

// Mock marked
jest.mock('marked', () => ({
    marked: {
        parse: jest.fn().mockImplementation((text) => Promise.resolve(text))
    }
}));

describe('MessageThread Component', () => {
    let store: ReturnType<typeof mockStore>;
    const mockUser = { id: '123', name: 'Test User' };

    beforeEach(() => {
        store = mockStore({
            auth: {
                user: mockUser
            }
        });
        mockScrollIntoView.mockClear();
    });

    it('renders empty state when no messages', () => {
        render(
            <Provider store={store}>
                <MessageThread messages={[]} loading={false} />
            </Provider>
        );

        expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
        render(
            <Provider store={store}>
                <MessageThread messages={[]} loading={true} />
            </Provider>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders messages correctly', async () => {
        const messages: Message[] = [
            {
                id: '1',
                content: 'Hello',
                role: 'user',
                timestamp: new Date().toISOString(),
                platform: 'web',
                sender: mockUser
            },
            {
                id: '2',
                content: 'Hi there!',
                role: 'assistant',
                timestamp: new Date().toISOString(),
                platform: 'web',
                sender: { id: 'assistant', name: 'AI Assistant' }
            }
        ];

        render(
            <Provider store={store}>
                <MessageThread messages={messages} loading={false} />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Hello')).toBeInTheDocument();
            expect(screen.getByText('Hi there!')).toBeInTheDocument();
        });

        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
}); 