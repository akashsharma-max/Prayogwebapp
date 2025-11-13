
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundIcon = () => (
    <svg className="w-40 h-40 text-primary-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
             <NotFoundIcon />
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 font-heading mt-4">404</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">Oops! Page Not Found.</p>
            <p className="text-gray-500 mt-2 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
            <Link to="/dashboard" className="mt-8 px-6 py-3 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors">
                Go To Dashboard
            </Link>
        </div>
    );
};

export default NotFoundPage;