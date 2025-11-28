
import React, { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RefreshIcon, SearchIcon, PlusCircleIcon, MoreVerticalIcon } from '../../components/icons';

// Types based on API response
interface ContactNumber {
    id: string;
    type: string;
    number: string;
}

interface Email {
    id: string;
    type: string;
    email: string;
}

interface Address {
    id: string;
    type: string;
    line1: string;
    postalCode: string;
    city: string | null;
    state: string | null;
}

interface SubTenant {
    id: string;
    organizationName: string;
    ownerName: string;
    status: string;
    type: string;
    createdAt: string;
    contactNumbers: ContactNumber[];
    emails: Email[];
    addresses: Address[];
    logo: string | null;
}

interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let classes = 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    
    switch (status) {
        case 'ACTIVE':
            classes = 'bg-success-lighter text-success-darker dark:bg-success-darker dark:text-success-light';
            break;
        case 'PENDING':
            classes = 'bg-warning-lighter text-warning-darker dark:bg-warning-darker dark:text-warning-light';
            break;
        case 'INACTIVE':
        case 'SUSPENDED':
            classes = 'bg-error-lighter text-error-darker dark:bg-error-darker dark:text-error-light';
            break;
    }
    
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}>
            {status}
        </span>
    );
};

const SubTenantsPage: React.FC = () => {
    const [subTenants, setSubTenants] = useState<SubTenant[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    const fetchSubTenants = useCallback(async (page: number, pageSize: number) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            params.append('type', 'FRANCHISE');
            params.append('sortBy', 'name');
            params.append('sortOrder', 'asc');

            const response = await apiClient.get('/gateway/onboarding/api/v1/onboarding', params);
            
            if (response.status === 'success' && response.data) {
                setSubTenants(response.data.items);
                setPagination(response.data.pagination);
            } else {
                throw new Error(response.message || 'Failed to fetch sub-tenants');
            }
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "Failed to load sub-tenants";
            addToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchSubTenants(pagination.page, pagination.pageSize);
    }, [fetchSubTenants, pagination.page, pagination.pageSize]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const filteredTenants = subTenants.filter(t => 
        (t.organizationName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-custom-light">
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-muted-foreground" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search Sub-Tenants..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:ring-primary-main focus:outline-none"
                    />
                </div>
                <button 
                    onClick={() => addToast('Create Sub-Tenant functionality coming soon!', 'success')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Sub-Tenant
                </button>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-custom-light overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left responsive-table">
                        <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3">Organization</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-card">
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-2/3"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground bg-card">
                                        No sub-tenants found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTenants.map((tenant) => (
                                    <tr key={tenant.id} className="hover:bg-muted/50 transition-colors bg-card">
                                        <td className="px-6 py-4 font-medium text-foreground" data-label="Organization">
                                            <div className="flex items-center gap-3">
                                                {tenant.logo ? (
                                                    <img src={tenant.logo} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center text-primary-main font-bold border border-primary-light">
                                                        {(tenant.organizationName || 'U').charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold">{tenant.organizationName || 'N/A'}</div>
                                                    <div className="text-xs text-muted-foreground font-normal">{tenant.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground" data-label="Owner">{tenant.ownerName || 'N/A'}</td>
                                        <td className="px-6 py-4" data-label="Contact">
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="text-foreground mb-1">{tenant.emails.find(e => e.type === 'PRIMARY')?.email || 'N/A'}</span>
                                                <span>{tenant.contactNumbers.find(c => c.type === 'PRIMARY')?.number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <StatusBadge status={tenant.status} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground" data-label="Created At">
                                            {new Date(tenant.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <button className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
                                                <MoreVerticalIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {!isLoading && pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border bg-card">
                        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} entries
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
        </div>
    );
};

export default SubTenantsPage;
