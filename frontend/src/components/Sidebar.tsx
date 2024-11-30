import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '../store';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

const platforms = [
    { name: 'WhatsApp', status: 'connected' },
    { name: 'Facebook', status: 'connected' },
    { name: 'Line', status: 'disconnected' },
    { name: 'Viber', status: 'connected' },
    { name: 'Telegram', status: 'connected' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
    const { activeTab } = useSelector((state: RootState) => state.ui);

    const navItems = [
        {
            name: 'Messages',
            path: '/messaging',
            icon: ChatBubbleLeftRightIcon,
        },
        {
            name: 'Contacts',
            path: '/contacts',
            icon: UserGroupIcon,
        },
        {
            name: 'Analytics',
            path: '/analytics',
            icon: ChartBarIcon,
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: Cog6ToothIcon,
        },
    ];

    return (
        <aside
            className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-30 w-64 transition duration-300 transform bg-white dark:bg-gray-800 overflow-y-auto lg:translate-x-0 lg:static lg:inset-0`}
        >
            <div className="flex items-center justify-between flex-shrink-0 p-4">
                <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Navigation
                </span>
                <button
                    onClick={onToggle}
                    className="p-1 rounded-lg lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            <nav className="mt-5 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }: { isActive: boolean }) =>
                            `flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-8">
                <div className="px-4 py-2">
                    <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        Platform Status
                    </h2>
                </div>
                <div className="mt-2 space-y-1">
                    {platforms.map((platform) => (
                        <div
                            key={platform.name}
                            className="flex items-center px-4 py-2 text-sm text-gray-600 dark:text-gray-300"
                        >
                            <span
                                className={`w-2 h-2 mr-2 rounded-full ${platform.status === 'connected'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                    }`}
                            />
                            {platform.name}
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 