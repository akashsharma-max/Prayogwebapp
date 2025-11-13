import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { WidgetData } from '../../../types';
import { RefreshIcon } from '../../../components/icons';

const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><path d="M12 5v14m-7-7 7-7 7 7"/></svg>
);

const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><path d="M12 5v14m7-7-7 7-7-7"/></svg>
);

const formatNumber = (num: number, isCurrency: boolean = false) => {
  const options = isCurrency ? { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 } : {};
  return new Intl.NumberFormat('en-US', options).format(num);
};

const colorConfig = {
    primary: { hex: '#2675FE', bg: 'bg-primary-lighter', text: 'text-primary-main' },
    info: { hex: '#00B8D9', bg: 'bg-info-lighter', text: 'text-info-main' },
    error: { hex: '#FF5630', bg: 'bg-error-lighter', text: 'text-error-main' },
};

interface WidgetSummaryCardProps {
    widget: WidgetData;
    isLoading: boolean;
    onRefresh: () => void;
}

const WidgetSummaryCard: React.FC<WidgetSummaryCardProps> = ({ widget, isLoading, onRefresh }) => {
    const { title, total, percent, chartData, color, isCurrency } = widget;
    const isPositive = percent >= 0;
    const config = colorConfig[color];

    return (
        <div className={`p-6 bg-white rounded-lg shadow-sm`}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
                <button onClick={onRefresh} className="text-gray-400 hover:text-gray-600">
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                </button>
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-800">
                {formatNumber(total, isCurrency)}
            </div>
            <div className="flex items-center mt-1 text-sm">
                <span className={`flex items-center font-semibold ${isPositive ? 'text-success-main' : 'text-error-main'}`}>
                    {isPositive ? <ArrowUpIcon className="w-4 h-4 mr-1"/> : <ArrowDownIcon className="w-4 h-4 mr-1"/>}
                    {Math.abs(percent)}%
                </span>
                <span className="ml-1 text-gray-500">than last week</span>
            </div>
             <div className="h-20 mt-4 -mx-6 -mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.map(v => ({ value: v }))} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.hex} stopOpacity={0.2}/>
                                <stop offset="95%" stopColor={config.hex} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ display: 'none' }}/>
                        <Area type="monotone" dataKey="value" stroke={config.hex} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${color})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default WidgetSummaryCard;
