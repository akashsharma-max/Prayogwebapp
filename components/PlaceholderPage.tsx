import React from 'react';
import { useLocation } from 'react-router-dom';

const getTitleFromPath = (path: string): string => {
    if (path === '/') return 'Dashboard';
    const parts = path.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || '';
    return lastPart
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const PlaceholderPage: React.FC = () => {
    const location = useLocation();
    const title = getTitleFromPath(location.pathname);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-white rounded-lg shadow">
            <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
            <p className="mt-4 text-lg text-gray-500">Coming Soon!</p>
        </div>
    );
};

export default PlaceholderPage;