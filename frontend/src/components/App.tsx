import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const App: React.FC = () => {
    return (
        <div className="app-container min-h-screen bg-gray-50 dark:bg-gray-900">
            <Router>
                {/* Add your routes here */}
            </Router>
        </div>
    );
};

export default App; 