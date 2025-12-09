import React from 'react';
import { RateCard, RateCardStatus } from '../../../types';

interface RateCardTableProps {
    rateCards: RateCard[];
    isLoading?: boolean;
}

const StatusBadge: React.FC<{ status: RateCardStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
    let colorClasses = "";

    switch (status) {
        case RateCardStatus.Active:
            colorClasses = "bg-success-lighter text-success-darker dark:bg-success-darker dark:text-success-light";
            break;
        case RateCardStatus.Inactive:
            colorClasses = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
            break;
        case RateCardStatus.Draft:
            colorClasses = "bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light";
            break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const RateCardTable: React.FC<RateCardTableProps> = ({ rateCards, isLoading = false }) => {
    return (
        <div className="bg-card rounded-lg shadow-custom-light overflow-hidden border border-border">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border responsive-table">
                    <thead className="bg-muted">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Region</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Service</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-5 bg-muted rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-8 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : rateCards.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No rate cards found.
                                </td>
                            </tr>
                        ) : (
                            rateCards.map((card) => (
                                <tr key={card.id} className="hover:bg-muted">
                                    <td data-label="Name" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{card.name}</td>
                                    <td data-label="Region" className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{card.region}</td>
                                    <td data-label="Service" className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{card.service}</td>
                                    <td data-label="Price" className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {typeof card.price === 'number' ? `$${card.price.toFixed(2)}` : card.price}
                                    </td>
                                    <td data-label="Status" className="px-6 py-4 whitespace-nowrap text-sm">
                                        <StatusBadge status={card.status} />
                                    </td>
                                    <td data-label="Actions" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href="#" className="text-primary-main hover:text-primary-dark">Edit</a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RateCardTable;