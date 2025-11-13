import React from 'react';
import { TopSubTenant } from '../../../types';
import { RefreshIcon } from '../../../components/icons';

const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <circle cx="12" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
    </svg>
);

const ProfitLoss: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-success-main' : 'text-error-main';
    const sign = isPositive ? '+' : '';
    return (
        <span className={color}>
            {sign}{(value * 100).toFixed(1)}%
        </span>
    );
};


interface TopSubTenantsTableProps {
    tenants: TopSubTenant[];
    isLoading: boolean;
    onRefresh: () => void;
}

const TopSubTenantsTable: React.FC<TopSubTenantsTableProps> = ({ tenants, isLoading, onRefresh }) => {
    return (
        <div className="p-6 bg-card rounded-lg shadow-sm h-full border border-border">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">Top Sub-Tenants</h3>
                <button onClick={onRefresh} className="text-muted-foreground hover:text-foreground">
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                </button>
            </div>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left text-muted-foreground">
                    <thead className="text-xs text-foreground uppercase bg-muted">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Owner Name</th>
                            <th scope="col" className="px-6 py-3">Revenue</th>
                            <th scope="col" className="px-6 py-3">P/L</th>
                            <th scope="col" className="px-1 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="bg-card border-b border-border hover:bg-muted">
                                <th scope="row" className="px-6 py-4 font-medium text-foreground whitespace-nowrap flex items-center">
                                    <img src={tenant.avatarUrl} alt={tenant.name} className="w-8 h-8 rounded-full mr-3" />
                                    {tenant.name}
                                </th>
                                <td className="px-6 py-4">{tenant.owner}</td>
                                <td className="px-6 py-4">${tenant.revenue.toLocaleString()}</td>
                                <td className="px-6 py-4 font-semibold">
                                    <ProfitLoss value={tenant.profit} />
                                </td>
                                <td className="px-1 py-4 text-center">
                                    <button className="text-muted-foreground hover:text-foreground">
                                        <MoreIcon />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopSubTenantsTable;