import React from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' },
    { id: 'line', name: 'Line', icon: '🟢' },
    { id: 'viber', name: 'Viber', icon: '💜' },
];

const PlatformSelector: React.FC = () => {
    const [selectedPlatform, setSelectedPlatform] = React.useState(platforms[0]);

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="mr-2">{selectedPlatform.icon}</span>
                {selectedPlatform.name}
                <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
            </Menu.Button>

            <Menu.Items className="absolute z-10 w-56 mt-2 origin-top-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                    {platforms.map((platform) => (
                        <Menu.Item key={platform.id}>
                            {({ active }) => (
                                <button
                                    onClick={() => setSelectedPlatform(platform)}
                                    className={`${active
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                            : 'text-gray-700 dark:text-gray-200'
                                        } group flex items-center w-full px-4 py-2 text-sm`}
                                >
                                    <span className="mr-3">{platform.icon}</span>
                                    {platform.name}
                                    {selectedPlatform.id === platform.id && (
                                        <span className="absolute right-4">✓</span>
                                    )}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </div>
            </Menu.Items>
        </Menu>
    );
};

export default PlatformSelector; 