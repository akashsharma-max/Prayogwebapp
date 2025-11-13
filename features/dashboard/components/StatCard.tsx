
import React from 'react';
import { StatCardData } from '../../../types';

const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5v14m-7-7 7-7 7 7"/></svg>
);

const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 5v14m7-7-7 7-7-7"/></svg>
);

const StatCard: React.FC<StatCardData> = ({ title, value, change, changeType, icon: Icon }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-success-main' : 'text-error-main';

    return (
        <div className="p-6 bg-white rounded-lg shadow-custom-light">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className="p-3 bg-primary-lighter rounded-full">
                    <Icon className="w-6 h-6 text-primary-main" />
                </div>
            </div>
            <div className={`flex items-center mt-4 text-sm ${changeColor}`}>
                {isIncrease ? <ArrowUpIcon /> : <ArrowDownIcon />}
                <span className="ml-1 font-semibold">{change}</span>
                <span className="ml-1 text-gray-500">vs last month</span>
            </div>
        </div>
    );
};

export default StatCard;
