
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { revenueData } from '../../../mocks/data';

const RevenueChart: React.FC = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-custom-light h-96">
            <h3 className="text-lg font-semibold text-gray-800 font-heading">Monthly Revenue</h3>
            <div className="mt-4 h-full w-full">
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                        <Tooltip
                            cursor={{ fill: 'rgba(196, 205, 213, 0.2)' }}
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: '1px solid #DFE3E8' }}
                        />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                           {revenueData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2675FE' : '#6FA3FD'} />
                           ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
