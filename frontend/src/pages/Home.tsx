import React from 'react';
import { Link } from 'react-router-dom';

function Home(): JSX.Element {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                <div className="lg:text-center">
                    <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
                        SEVEN7K
                    </h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        Unified Messaging Platform
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                        Connect with your customers across multiple messaging platforms in one place.
                    </p>
                </div>

                <div className="mt-10">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
                        <Link
                            to="/login"
                            className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                        >
                            Get Started
                        </Link>
                        <a
                            href="https://github.com/your-username/seven7k"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home; 