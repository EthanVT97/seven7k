import { render, screen } from '@testing-library/react';
import App from '../../App';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';

// Create a mock store
const store = configureStore({
    reducer: {
        // Add your reducers here
    }
});

const renderApp = () => {
    return render(
        <Provider store={store}>
            <App />
        </Provider>
    );
};

describe('App', () => {
    it('renders without crashing', () => {
        renderApp();
    });

    it('renders loading component initially', () => {
        renderApp();
        const loadingElement = screen.getByTestId('loading-spinner');
        expect(loadingElement).toBeInTheDocument();
    });
}); 