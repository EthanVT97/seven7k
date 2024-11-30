import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleSidebar, toggleTheme } from '../store/slices/uiSlice';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationContainer from './NotificationContainer';

function Layout(): JSX.Element {
    const dispatch = useDispatch();
    const { theme, sidebarOpen } = useSelector((state: RootState) => state.ui);

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
                <Sidebar isOpen={sidebarOpen} onToggle={() => dispatch(toggleSidebar())} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar onThemeToggle={() => dispatch(toggleTheme())} theme={theme} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
                        <div className="container mx-auto px-6 py-8">
                            <Outlet />
                        </div>
                    </main>
                </div>

                <NotificationContainer />
            </div>
        </div>
    );
}

export default Layout; 