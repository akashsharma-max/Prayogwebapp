
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, RefreshIcon, PlusCircleIcon, DocumentTextIcon } from '../../components/icons';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RateCard, RateCardStatus } from '../../types';

const StatusBadge: React.FC<{ status: RateCardStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-1 text-xs font-semibold rounded-full";
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

const RateCardItem: React.FC<{ data: RateCard, onView: (id: string) => void }> = ({ data, onView }) => (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-lighter text-primary-main rounded-lg">
                    <DocumentTextIcon className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-foreground line-clamp-1" title={data.name}>{data.name}</h3>
                    <p className="text-xs text-muted-foreground">{data.region}</p>
                </div>
            </div>
            <StatusBadge status={data.status} />
        </div>
        
        <div className="space-y-3 mb-6 flex-grow">
            <div className="flex justify-between text-sm py-2 border-b border-border border-dashed">
                <span className="text-muted-foreground">Service Types</span>
                <span className="font-medium text-foreground text-right">{data.service}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-border border-dashed">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-medium text-foreground">
                    {typeof data.price === 'number' ? `$${data.price}` : data.price}
                </span>
            </div>
        </div>

        <button 
            onClick={() => onView(data.id)} 
            className="w-full py-2.5 border border-primary-main text-primary-main rounded-md hover:bg-primary-lighter transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2"
        >
            View Details
        </button>
    </div>
);

const RateCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm h-64 animate-pulse flex flex-col">
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-3 w-full">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
            </div>
            <div className="w-16 h-6 bg-muted rounded-full"></div>
        </div>
        <div className="space-y-4 flex-grow">
             <div className="h-4 bg-muted rounded w-full"></div>
             <div className="h-4 bg-muted rounded w-full"></div>
        </div>
        <div className="h-10 bg-muted rounded w-full mt-4"></div>
    </div>
);

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
                    region: item.zoneGroupId ? 'Zone Based' : 'Global', 
                    service: item.matrices?.length > 0 
                        ? item.matrices.map((m: any) => m.matrixKey).join(', ') 
                        : item.productType,
                    price: 'Variable', // Complex pricing structure
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

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRateCards();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchRateCards]); 

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); 
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-custom-light">
                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search rate cards..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-1 focus:ring-primary-main focus:border-primary-main"
                    />
                </div>
                 <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => fetchRateCards()}
                        className="p-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                    </button>
                    <button 
                        onClick={() => navigate('/finance/rate-cards/create')}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add New Card
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading && Array.from({ length: 8 }).map((_, i) => <RateCardSkeleton key={i} />)}
                
                {!isLoading && rateCards.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-lg border border-border">
                        <p className="text-lg font-medium">No rate cards found</p>
                        <p className="text-sm">Try adjusting your search terms or create a new one.</p>
                    </div>
                )}

                {!isLoading && rateCards.map((card) => (
                    <RateCardItem 
                        key={card.id} 
                        data={card} 
                        onView={(id) => navigate(`/finance/rate-cards/view/${id}`)} 
                    />
                ))}
            </div>
            
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
