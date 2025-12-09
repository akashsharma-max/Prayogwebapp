import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RateCardTable from './components/RateCardTable';
import { SearchIcon, RefreshIcon } from '../../components/icons';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RateCard, RateCardStatus } from '../../types';

const RateCardsPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [rateCards, setRateCards] = useState<RateCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    });

    const fetchRateCards = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());
            if (searchTerm.trim()) {
                params.append('searchName', searchTerm.trim());
            }

            const response = await apiClient.get('/gateway/ure/api/rate-cards/unified/all', params);
            
            if (response.status === 'success' && Array.isArray(response.data)) {
                const mappedData: RateCard[] = response.data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    // API doesn't provide a direct region name, using a placeholder or derivation
                    region: 'Multi-Zone', 
                    // Join matrix keys as service names, or fallback to product type
                    service: item.matrices?.length > 0 
                        ? item.matrices.map((m: any) => m.matrixKey).join(', ') 
                        : item.productType,
                    // Price is complex (matrices + slabs), so we show "Variable" or similar
                    price: 'Variable',
                    status: item.isActive ? RateCardStatus.Active : RateCardStatus.Inactive
                }));
                
                setRateCards(mappedData);
                
                if (response.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.pagination.total,
                        totalPages: response.pagination.totalPages
                    }));
                }
            } else {
                setRateCards([]);
            }
        } catch (error) {
             const msg = error instanceof ApiError ? error.message : "Failed to load rate cards";
             addToast(msg, 'error');
             setRateCards([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, addToast]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRateCards();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchRateCards]); // searchTerm is dependency of fetchRateCards via callback dependency array

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-card rounded-lg shadow-custom-light border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by rate card name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-input placeholder-muted-foreground text-foreground focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-main focus:border-primary-main sm:text-sm"
                    />
                </div>
                 <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={() => fetchRateCards()}
                        className="p-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                    </button>
                    <button 
                        onClick={() => navigate('/finance/rate-cards/create')}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors w-full md:w-auto flex-shrink-0"
                    >
                        + Add New Card
                    </button>
                 </div>
            </div>

            <RateCardTable rateCards={rateCards} isLoading={isLoading} />
            
            {!isLoading && pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card rounded-lg border border-border">
                    <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-foreground bg-card transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-4 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-foreground bg-card transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateCardsPage;