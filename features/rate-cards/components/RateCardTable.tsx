
import React from 'react';
import { RateCard, RateCardStatus } from '../../../types';

interface RateCardTableProps {
    rateCards: RateCard[];
}

const StatusBadge: React.FC<{ status: RateCardStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
    let colorClasses = "";

    switch (status) {
        case RateCardStatus.Active:
            colorClasses = "bg-success-lighter text-success-darker";
            break;
        case RateCardStatus.Inactive:
            colorClasses = "bg-gray-200 text-gray-700";
            break;
        case RateCardStatus.Draft:
            colorClasses = "bg-info-lighter text-info-darker";
            break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

const RateCardTable: React.FC<RateCardTableProps> = ({ rateCards }) => {
    return (
        <div className="bg-white rounded-lg shadow-custom-light overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 responsive-table">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Region</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Service</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rateCards.map((card) => (
                            <tr key={card.id} className="hover:bg-gray-50">
                                <td data-label="Name" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{card.name}</td>
                                <td data-label="Region" className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{card.region}</td>
                                <td data-label="Service" className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{card.service}</td>
                                <td data-label="Price" className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${card.price.toFixed(2)}</td>
                                <td data-label="Status" className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={card.status} />
                                </td>
                                <td data-label="Actions" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="#" className="text-primary-main hover:text-primary-dark">Edit</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RateCardTable;