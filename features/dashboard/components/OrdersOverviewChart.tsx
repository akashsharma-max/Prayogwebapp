import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartData } from '../../../types';
import { RefreshIcon } from '../../../components/icons';

const colors = ['#2675FE', '#00B8D9', '#FFAB00'];

interface OrdersOverviewChartProps {
    chartData: ChartData;
    isLoading: boolean;
    onRefresh: () => void;
}

const OrdersOverviewChart: React.FC<OrdersOverviewChartProps> = ({ chartData, isLoading, onRefresh }) => {
    const { categories, series } = chartData;

    const formattedData = categories.map((category, index) => {
        const dataPoint: { name: string; [key: string]: string | number } = { name: category };
        series.forEach(s => {
            dataPoint[s.name] = s.data[index];
        });
        return dataPoint;
    });

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Orders Overview</h3>
                    <p className="text-sm text-gray-500">Order status breakdown for {new Date().getFullYear()}</p>
                </div>
                <button onClick={onRefresh} className="text-gray-400 hover:text-gray-600">
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                </button>
            </div>
            <div className="h-80 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={formattedData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} />
                        <Tooltip
                             contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #DFE3E8' }}
                             cursor={{ strokeDasharray: '3 3' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                        {series.map((s, index) => (
                            <Area
                                key={s.name}
                                type="monotone"
                                dataKey={s.name}
                                stroke={colors[index % colors.length]}
                                fill={colors[index % colors.length]}
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default OrdersOverviewChart;
