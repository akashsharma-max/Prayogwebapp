
import React, { useState, useEffect, useCallback } from 'react';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { SearchIcon, PlusCircleIcon, MoreVerticalIcon, RefreshIcon, LocationPinIcon, XCircleIcon } from '../../components/icons';

interface ZoneGroup {
    id: string;
    groupKey: string;
    description: string;
    zoneType: string;
    zoneCount: number;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface CreateZoneGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateZoneGroupModal: React.FC<CreateZoneGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        groupKey: '',
        description: '',
        zoneType: 'rule'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({ groupKey: '', description: '', zoneType: 'rule' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.groupKey.trim()) {
            addToast('Group Key is required', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await apiClient.post('/gateway/zone-management/api/zone-groups', formData);
            if (response.status === 'success') {
                 addToast('Zone Group created successfully', 'success');
                 onSuccess();
                 onClose();
            } else {
                 throw new Error(response.message || 'Failed to create zone group');
            }
        } catch (error) {
             const msg = error instanceof ApiError ? error.message : "Failed to create zone group";
             addToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-lg shadow-lg border border-border p-6 animate-fade-in-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-foreground">Create Zone Group</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Group Key <span className="text-error-main">*</span></label>
                        <input 
                            type="text" 
                            name="groupKey" 
                            value={formData.groupKey} 
                            onChange={handleChange} 
                            className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main focus:outline-none"
                            placeholder="e.g. default_courier_zones"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                         <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main focus:outline-none"
                            placeholder="Describe this zone group..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Zone Type</label>
                        <select 
                            name="zoneType" 
                            value={formData.zoneType} 
                            onChange={handleChange} 
                            className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main focus:outline-none"
                        >
                            <option value="rule">Rule</option>
                            <option value="range">Range</option>
                            <option value="static">Static</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 border border-border rounded-md hover:bg-muted text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {isSubmitting && <RefreshIcon className="w-4 h-4 animate-rotate" />}
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ZoneManagementPage: React.FC = () => {
    const [zoneGroups, setZoneGroups] = useState<ZoneGroup[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { addToast } = useToast();

    const fetchZoneGroups = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());
            if (searchQuery.trim()) {
                params.append('search', searchQuery.trim());
            }

            const response = await apiClient.get('/gateway/zone-management/api/zone-groups', params);

            if (response.status === 'success' && response.data) {
                setZoneGroups(response.data.zoneGroups || []);
                setPagination(response.data.pagination);
            } else {
                 setZoneGroups([]);
            }
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "Failed to load zone groups";
            addToast(msg, 'error');
            setZoneGroups([]);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, addToast]);

    // Debounce search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchZoneGroups();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchZoneGroups]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleRefresh = () => {
        fetchZoneGroups();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-custom-light">
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="text-muted-foreground" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search zone groups..." 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:ring-primary-main focus:outline-none"
                    />
                </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm w-full sm:w-auto justify-center"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add Zone Group
                </button>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-custom-light overflow-hidden">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <LocationPinIcon className="w-5 h-5 text-primary-main" />
                        Zone Groups
                    </h2>
                    <button onClick={handleRefresh} className="p-2 text-muted-foreground hover:text-primary-main rounded-full hover:bg-muted transition-colors">
                        <RefreshIcon className={`w-4 h-4 ${isLoading ? 'animate-rotate' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left responsive-table">
                        <thead className="bg-muted text-xs uppercase font-semibold text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3">Group Key</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3 text-center">Zones</th>
                                <th className="px-6 py-3">Created At</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading && zoneGroups.length === 0 ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse bg-card">
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : zoneGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground bg-card">
                                        No zone groups found.
                                    </td>
                                </tr>
                            ) : (
                                zoneGroups.map((group) => (
                                    <tr key={group.id} className="hover:bg-muted/50 transition-colors bg-card">
                                        <td className="px-6 py-4 font-medium text-foreground" data-label="Group Key">
                                            {group.groupKey}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground" data-label="Description">
                                            {group.description}
                                        </td>
                                        <td className="px-6 py-4" data-label="Type">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light border border-info-light dark:border-info-dark capitalize">
                                                {group.zoneType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-semibold text-foreground" data-label="Zones">
                                            {group.zoneCount}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground" data-label="Created At">
                                            {new Date(group.createdAt).toLocaleDateString()}
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
                
                {pagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border bg-card">
                        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="px-4 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-foreground bg-card transition-colors"
                            >
                                Previous
                            </button>
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="px-4 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-foreground bg-card transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreateZoneGroupModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setPagination(prev => ({ ...prev, page: 1 }));
                    fetchZoneGroups();
                }}
            />
        </div>
    );
};

export default ZoneManagementPage;
