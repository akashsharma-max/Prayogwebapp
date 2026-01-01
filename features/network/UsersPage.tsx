
import React, { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RefreshIcon, SearchIcon, PlusCircleIcon, MoreVerticalIcon, UserCircleIcon } from '../../components/icons';

interface Role {
    id: string;
    role: string;
}

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

interface UserOnboardingItem {
    id: string;
    ownerName: string;
    role: Role | null;
    status: string;
    createdAt: string;
    contactNumbers: ContactNumber[];
    emails: Email[];
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

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserOnboardingItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(async (page: number, pageSize: number) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', pageSize.toString());
            params.append('type', 'USER');

            const response = await apiClient.get('/gateway/onboarding/api/v1/onboarding', params);
            
            if (response.status === 'success' && response.data) {
                setUsers(response.data.items);
                setPagination(response.data.pagination);
            } else {
                throw new Error(response.message || 'Failed to fetch users');
            }
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "Failed to load users";
            addToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchUsers(pagination.page, pagination.pageSize);
    }, [fetchUsers, pagination.page, pagination.pageSize]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const filteredUsers = users.filter(u => 
        (u.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u.role?.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.emails.some(e => e.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
                        placeholder="Search Users..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:ring-primary-main focus:outline-none"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => fetchUsers(pagination.page, pagination.pageSize)}
                        className="p-2 border border-border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Refresh"
                    >
                        <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                    </button>
                    <button 
                        onClick={() => addToast('Create User functionality coming soon!', 'success')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm w-full sm:w-auto justify-center"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add User
                    </button>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-custom-light overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left responsive-table">
                        <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3">User Details</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined Date</th>
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
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground bg-card">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/50 transition-colors bg-card">
                                        <td className="px-6 py-4 font-medium text-foreground" data-label="User Details">
                                            <div className="flex items-center gap-3">
                                                {user.logo ? (
                                                    <img src={user.logo} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center text-primary-main font-bold border border-primary-light">
                                                        {(user.ownerName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold">{user.ownerName || 'N/A'}</div>
                                                    <div className="text-xs text-muted-foreground font-normal">{user.emails.find(e => e.type === 'PRIMARY')?.email || 'No email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-foreground" data-label="Role">
                                            {user.role?.role || 'No Role Assigned'}
                                        </td>
                                        <td className="px-6 py-4" data-label="Contact">
                                            <div className="flex flex-col text-xs text-muted-foreground">
                                                <span className="text-foreground">{user.contactNumbers.find(c => c.type === 'PRIMARY')?.number || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Status">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground" data-label="Joined Date">
                                            {new Date(user.createdAt).toLocaleDateString()}
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

export default UsersPage;
