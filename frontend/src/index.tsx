import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find the root element');
}

// Clear the existing HTML content
container.innerHTML = '';

// Create a root
const root = createRoot(container);

// Initial render
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);