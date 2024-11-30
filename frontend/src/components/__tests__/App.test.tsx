import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import App from '../App';
import { ThemeProvider } from '../../theme/ThemeProvider';

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <Provider store={store}>
            <ThemeProvider>
                {component}
            </ThemeProvider>
        </Provider>
    );
};

describe('App', () => {
    it('renders without crashing', () => {
        renderWithProviders(<App />);
        // The app should render without crashing
        expect(document.querySelector('.app-container')).toBeInTheDocument();
    });
}); 