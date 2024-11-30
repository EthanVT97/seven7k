import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import MessageThread from '../MessageThread';

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: mockScrollIntoView,
});

describe('MessageThread Component', () => {
    beforeEach(() => {
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