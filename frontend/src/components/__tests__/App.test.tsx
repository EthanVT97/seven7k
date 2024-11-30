import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Create a mock store
const store = configureStore({
    reducer: {
        // Add your reducers here when you have them
        // For now, we'll use an empty reducer
        _placeholder: (state = {}) => state
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false
        })
});

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                {ui}
            </MemoryRouter>
        </Provider>
    );
};

describe('App', () => {
    it('renders without crashing', () => {
        renderWithProviders(<App />);
        // The loading spinner should be visible initially due to React.lazy
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    // Add more tests as needed for your app's functionality
}); 