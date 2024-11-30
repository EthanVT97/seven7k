import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from '@headlessui/react';
import {
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { RootState } from '../store';
import { removeNotification } from '../store/slices/uiSlice';

const NotificationContainer: React.FC = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.ui.notifications);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
            case 'error':
                return <XCircleIcon className="h-6 w-6 text-red-400" />;
            case 'warning':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
            default:
                return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
        }
    };

    const getBackgroundColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900';
            case 'error':
                return 'bg-red-50 dark:bg-red-900';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900';
            default:
                return 'bg-blue-50 dark:bg-blue-900';
        }
    };

    useEffect(() => {
        notifications.forEach((notification) => {
            const timer = setTimeout(() => {
                dispatch(removeNotification(notification.id));
            }, 5000);

            return () => clearTimeout(timer);
        });
    }, [notifications, dispatch]);

    return (
        <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <Transition
                        key={notification.id}
                        show={true}
                        enter="transform ease-out duration-300 transition"
                        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div
                            className={`max-w-sm w-full ${getBackgroundColor(
                                notification.type
                            )} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
                        >
                            <div className="p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex">
                                        <button
                                            className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() =>
                                                dispatch(removeNotification(notification.id))
                                            }
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                ))}
            </div>
        </div>
    );
};

export default NotificationContainer; 