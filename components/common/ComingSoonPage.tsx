
import React from 'react';

const ComingSoonIcon = () => (
     <svg className="w-40 h-40 text-primary-main" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.42-.312.92-.491 1.45-.565A9 9 0 0121 12a9 9 0 01-9 9 9 9 0 01-9-9c0-.616.062-1.22.182-1.802.128-.62.357-1.206.676-1.74L10.325 4.317z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 21.077a9 9 0 006-15.056" opacity=".5"/>
     </svg>
);


const ComingSoonPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <ComingSoonIcon />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 font-heading mt-4">Coming Soon!</h1>
            <p className="text-lg md:text-xl text-gray-600 mt-2">We're working hard to bring this feature to you.</p>
            <p className="text-gray-500 mt-2">Please check back later!</p>
        </div>
    );
};

export default ComingSoonPage;