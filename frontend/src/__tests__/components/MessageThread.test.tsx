import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MessageThread from '../../components/messaging/MessageThread';

const mockStore = configureStore([]);

describe('MessageThread Component', () => {
    let store: ReturnType<typeof mockStore>;

    beforeEach(() => {
        store = mockStore({
            auth: {
                user: { id: '123', name: 'Test User' }
            }
        });
    });

    it('renders empty state when no messages', () => {
        render(
            <Provider store={store}>
                <MessageThread messages={[]} loading={false} />
            </Provider>
        );

        expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });

    it('renders loading state correctly', () => {
        render(
            <Provider store={store}>
                <MessageThread messages={[]} loading={true} />
            </Provider>
        );

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
}); 