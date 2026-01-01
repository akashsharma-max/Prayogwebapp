
import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RefreshIcon, SearchIcon, PlusCircleIcon, MoreVerticalIcon, XCircleIcon, DocumentTextIcon, UserCircleIcon, CheckCircleFilledIcon, InfoIcon, PackageIcon } from '../../components/icons';

// Types based on API response
interface ContactNumber {
    id?: string;
    type: string;
    country: string;
    number: string;
    isVerified: boolean;
}

interface Email {
    id?: string;
    type: string;
    country: string;
    email: string;
    isVerified: boolean;
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

interface RateCardItem {
    id: string;
    name: string;
    productType: string;
    isActive: boolean;
    matrices?: any[];
    charges?: any[];
}

// --- Add Sub-Tenant Modal Component ---
interface AddSubTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddSubTenantModal: React.FC<AddSubTenantModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rateCards, setRateCards] = useState<RateCardItem[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [rateSearch, setRateSearch] = useState('');

    const [formData, setFormData] = useState({
        organizationName: '',
        ownerName: '',
        email: '',
        phone: '',
        rateCardId: '',
        logo: ''
    });

    // Fetch Rate Cards for selection
    useEffect(() => {
        if (isOpen) {
            const fetchRates = async () => {
                setIsLoadingRates(true);
                try {
                    const response = await apiClient.get('/gateway/ure/api/rate-cards/unified/all');
                    if (response.status === 'success' && Array.isArray(response.data)) {
                        setRateCards(response.data);
                    }
                } catch (error) {
                    console.error("Failed to load rate cards", error);
                } finally {
                    setIsLoadingRates(false);
                }
            };
            fetchRates();
        }
    }, [isOpen]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const uploadData = new FormData();
            uploadData.append('files', file);
            uploadData.append('fileType', file.type);
            uploadData.append('path', 'prayog/onboarding/logos/');

            setIsUploading(true);
            try {
                const response = await apiClient.upload('/gateway/file-service/upload', uploadData);
                if (response.status === 200 && response.data?.[0]?.url) {
                    setFormData(prev => ({ ...prev, logo: response.data[0].url }));
                    addToast('Logo uploaded successfully', 'success');
                }
            } catch (error) {
                addToast('Failed to upload logo', 'error');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.organizationName || !formData.ownerName || !formData.email || !formData.phone || !formData.rateCardId) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        const selectedRateCard = rateCards.find(rc => rc.id === formData.rateCardId);
        
        setIsSubmitting(true);
        try {
            const quotationDate = new Date();
            const validUntil = new Date();
            validUntil.setMonth(validUntil.getMonth() + 3);

            const payload = {
                type: "FRANCHISE",
                status: "PENDING",
                organizationName: formData.organizationName,
                ownerName: formData.ownerName,
                logo: formData.logo || null,
                emails: [{
                    type: "PRIMARY",
                    country: "IN",
                    email: formData.email,
                    isVerified: false
                }],
                contactNumbers: [{
                    type: "PRIMARY",
                    country: "IN",
                    number: formData.phone.startsWith('+91-') ? formData.phone : `+91-${formData.phone}`,
                    isVerified: false
                }],
                quotations: [{
                    rateCardId: formData.rateCardId,
                    rateCardName: selectedRateCard?.name || "Selected Rate Card",
                    quotationDate: quotationDate.toISOString(),
                    validUntil: validUntil.toISOString()
                }]
            };

            const response = await apiClient.post('/gateway/onboarding/api/v1/onboarding', payload);
            
            if (response.status === 'success' || response.id) {
                addToast('Sub-Tenant onboarded successfully', 'success');
                onSuccess();
                onClose();
            } else {
                throw new Error(response.message || 'Onboarding failed');
            }
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "Failed to onboard sub-tenant";
            addToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredRateCards = rateCards.filter(rc => 
        rc.name.toLowerCase().includes(rateSearch.toLowerCase()) || 
        rc.productType.toLowerCase().includes(rateSearch.toLowerCase())
    );

    const selectedRateCard = rateCards.find(rc => rc.id === formData.rateCardId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-card w-full max-w-4xl rounded-xl shadow-2xl border border-border my-auto overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-lighter text-primary-main rounded-lg">
                            <PlusCircleIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Add New Sub-Tenant</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <XCircleIcon className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left Side: Tenant Info */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto border-r border-border">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Tenant Identity</h4>
                        
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted group-hover:border-primary-main transition-colors">
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="w-12 h-12 text-muted-foreground" />
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <RefreshIcon className="w-6 h-6 text-white animate-rotate" />
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    title="Upload Logo"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Click circle to upload tenant logo</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Organization Name <span className="text-error-main">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.organizationName}
                                    onChange={e => setFormData(p => ({ ...p, organizationName: e.target.value }))}
                                    className="w-full p-2.5 border border-border rounded-lg bg-input focus:ring-2 focus:ring-primary-main focus:outline-none transition-all"
                                    placeholder="e.g. Maruti Express"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Owner Full Name <span className="text-error-main">*</span></label>
                                <input 
                                    type="text" 
                                    value={formData.ownerName}
                                    onChange={e => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                                    className="w-full p-2.5 border border-border rounded-lg bg-input focus:ring-2 focus:ring-primary-main focus:outline-none transition-all"
                                    placeholder="e.g. Vikash Sharma"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Owner Email <span className="text-error-main">*</span></label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    className="w-full p-2.5 border border-border rounded-lg bg-input focus:ring-2 focus:ring-primary-main focus:outline-none transition-all"
                                    placeholder="vikash@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Contact Number <span className="text-error-main">*</span></label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-lg">+91</span>
                                    <input 
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full p-2.5 border border-border rounded-r-lg bg-input focus:ring-2 focus:ring-primary-main focus:outline-none transition-all"
                                        placeholder="9876543210"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Rate Card Selection */}
                    <div className="flex-1 p-6 bg-muted/10 overflow-y-auto flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Pricing Configuration</h4>
                        </div>

                        {/* Search Bar for Rate Cards */}
                        <div className="relative mb-4 shrink-0">
                            <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Search rate cards..."
                                value={rateSearch}
                                onChange={(e) => setRateSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-primary-main"
                            />
                        </div>

                        {/* Card Grid */}
                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                            {isLoadingRates ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg border border-border"></div>
                                ))
                            ) : filteredRateCards.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground text-sm italic">No rate cards found</div>
                            ) : (
                                filteredRateCards.map(rc => (
                                    <div 
                                        key={rc.id}
                                        onClick={() => setFormData(p => ({ ...p, rateCardId: rc.id }))}
                                        className={`group relative p-4 rounded-lg border cursor-pointer transition-all ${
                                            formData.rateCardId === rc.id 
                                            ? 'bg-primary-main border-primary-main shadow-md ring-2 ring-primary-lighter' 
                                            : 'bg-card border-border hover:border-primary-main'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${formData.rateCardId === rc.id ? 'bg-white/20 text-white' : 'bg-primary-lighter text-primary-main'}`}>
                                                    <DocumentTextIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold leading-none mb-1 ${formData.rateCardId === rc.id ? 'text-white' : 'text-foreground'}`}>
                                                        {rc.name}
                                                    </p>
                                                    <p className={`text-xs ${formData.rateCardId === rc.id ? 'text-primary-lighter' : 'text-muted-foreground'}`}>
                                                        {rc.productType}
                                                    </p>
                                                </div>
                                            </div>
                                            {formData.rateCardId === rc.id && (
                                                <CheckCircleFilledIcon className="w-5 h-5 text-white animate-fade-in" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Rate Card Details View */}
                        {selectedRateCard && (
                            <div className="mt-6 p-4 rounded-xl border border-primary-light bg-primary-lighter/10 animate-fade-in shadow-inner shrink-0">
                                <div className="flex items-center gap-2 mb-3 text-primary-main">
                                    <InfoIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Selected Rate Card Overview</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Structure:</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedRateCard.matrices?.length || 0} Matrices Defined
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Charge Components:</span>
                                        <span className="font-semibold text-foreground">
                                            {selectedRateCard.charges?.length || 0} Line Items
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedRateCard.matrices?.map((m: any, i: number) => (
                                            <span key={i} className="px-2 py-0.5 bg-white dark:bg-muted border border-border rounded text-[10px] text-muted-foreground">
                                                {m.matrixKey}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-6 py-2.5 border border-border rounded-lg hover:bg-muted font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading || !formData.rateCardId}
                        className="px-8 py-2.5 bg-primary-main text-white rounded-lg hover:bg-primary-dark font-semibold shadow-lg shadow-primary-main/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <><RefreshIcon className="w-5 h-5 animate-rotate" /> Onboarding...</>
                        ) : (
                            'Complete Onboarding'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const handleSuccess = () => {
        setPagination(p => ({ ...p, page: 1 }));
        fetchSubTenants(1, pagination.pageSize);
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
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm w-full sm:w-auto justify-center"
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

            <AddSubTenantModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleSuccess}
            />
        </div>
    );
};

export default SubTenantsPage;
