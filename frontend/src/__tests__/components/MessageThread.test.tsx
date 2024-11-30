import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MessageThread from '../../components/messaging/MessageThread';
import { store } from '../../store/store';

const mockStore = configureStore([]);

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: mockScrollIntoView,
});

describe('MessageThread Component', () => {
    let store: ReturnType<typeof mockStore>;

    beforeEach(() => {
        store = mockStore({
            auth: {
                user: { id: '123', name: 'Test User' }
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

    it('renders messages correctly', () => {
        const messages = [
            { id: '1', content: 'Hello', role: 'user' as const, timestamp: new Date().toISOString() },
            { id: '2', content: 'Hi there!', role: 'assistant' as const, timestamp: new Date().toISOString() }
        ];

        render(
            <Provider store={store}>
                <MessageThread messages={messages} loading={false} />
            </Provider>
        );

        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
}); 