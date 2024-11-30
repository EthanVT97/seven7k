import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { SunIcon, MoonIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

interface NavbarProps {
    onThemeToggle: () => void;
    theme: 'light' | 'dark';
}

const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, theme }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img
                                className="h-8 w-auto"
                                src="/logo.png"
                                alt="SEVEN7K"
                            />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                                SEVEN7K
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={onThemeToggle}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            {theme === 'dark' ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>

                        {user && (
                            <Menu as="div" className="ml-4 relative">
                                <Menu.Button className="flex items-center">
                                    <UserCircleIcon className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />
                                </Menu.Button>
                                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/profile"
                                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                    } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                            >
                                                Profile
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={handleLogout}
                                                className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                    } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                                            >
                                                Sign out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 