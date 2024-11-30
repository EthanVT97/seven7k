import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Suspense } from 'react';
import ModalManager from './components/modals/ModalManager';
import { ThemeProvider } from './theme/ThemeProvider';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Messaging = React.lazy(() => import('./pages/Messaging'));

// Loading component
const LoadingFallback = () => (
    <div className="flex justify-center items-center h-screen">
        <div
            data-testid="loading-spinner"
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"
        ></div>
    </div>
);

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="text-red-500 p-4">
            <h1>Something went wrong:</h1>
            <pre>{error.message}</pre>
            <button
                onClick={resetErrorBoundary}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Try again
            </button>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <ThemeProvider>
                <Router>
                    <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<Home />} />
                                <Route path="login" element={<Login />} />
                                <Route
                                    path="dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="messaging"
                                    element={
                                        <ProtectedRoute>
                                            <Messaging />
                                        </ProtectedRoute>
                                    }
                                />
                            </Route>
                        </Routes>
                        <ModalManager />
                    </Suspense>
                </Router>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = true; // Replace with your auth logic
    return isAuthenticated ? <>{children}</> : <Login />;
};

export default App; 