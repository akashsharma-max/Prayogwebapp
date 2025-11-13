

import React, { useState, useMemo } from 'react';
import RateCardTable from './components/RateCardTable';
import { rateCards as allRateCards } from '../../mocks/data';

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);


const RateCardsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRateCards = useMemo(() => {
        if (!searchTerm) {
            return allRateCards;
        }
        return allRateCards.filter(card => 
            card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.service.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-card rounded-lg shadow-custom-light border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, region, or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-input placeholder-muted-foreground text-foreground focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-main focus:border-primary-main sm:text-sm"
                    />
                </div>
                 <button className="px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors w-full md:w-auto flex-shrink-0">
                    + Add New Card
                </button>
            </div>

            <RateCardTable rateCards={filteredRateCards} />
        </div>
    );
};

export default RateCardsPage;