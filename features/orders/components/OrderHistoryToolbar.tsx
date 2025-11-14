
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SearchIcon, FilterIcon, ChevronDownIcon, ViewColumnsIcon } from '../../../components/icons';
import { OrderStatus } from '../../../types';

type Filters = {
    awbNumber: string;
    deliveryPromise: string;
    paymentMode: string;
    orderStatus: OrderStatus[];
    startDate: string;
    endDate: string;
};

interface OrderHistoryToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    selectedRowCount: number;
    onBulkAction: (action: string) => void;
    allColumns: { id: string; label: string; }[];
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const allStatuses: OrderStatus[] = ['CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'PENDING', 'PROCESSING', 'FAILED', 'READY_FOR_DISPATCH'];
const allServiceTypes = ['Standard', 'Express', 'Same Day'];
const allPaymentModes = ['Prepaid', 'COD'];

const FilterPopover: React.FC<{
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    onClose: () => void;
}> = ({ filters, onFiltersChange, onClose }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleStatusChange = (status: OrderStatus) => {
        setLocalFilters(prev => {
            const newStatus = prev.orderStatus.includes(status)
                ? prev.orderStatus.filter(s => s !== status)
                : [...prev.orderStatus, status];
            return { ...prev, orderStatus: newStatus };
        });
    };

    const handleApply = () => {
        onFiltersChange(localFilters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters = { awbNumber: '', deliveryPromise: '', paymentMode: '', orderStatus: [], startDate: '', endDate: '' };
        setLocalFilters(clearedFilters);
        onFiltersChange(clearedFilters);
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-md shadow-lg z-20 border border-border p-4">
            <h4 className="font-semibold text-foreground mb-4">Filters</h4>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Document Number</label>
                    <input type="text" value={localFilters.awbNumber} onChange={e => setLocalFilters(f => ({...f, awbNumber: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-border rounded-md text-sm bg-input focus:outline-none focus:ring-primary-main"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                        <input type="date" value={localFilters.startDate} onChange={e => setLocalFilters(f => ({...f, startDate: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-border rounded-md text-sm bg-input focus:outline-none focus:ring-primary-main"/>
                    </div>
                     <div>
                        <label className="text-xs font-medium text-muted-foreground">End Date</label>
                        <input type="date" value={localFilters.endDate} onChange={e => setLocalFilters(f => ({...f, endDate: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-border rounded-md text-sm bg-input focus:outline-none focus:ring-primary-main"/>
                    </div>
                </div>
                 <div>
                    <label className="text-xs font-medium text-muted-foreground">Service Type</label>
                    <select value={localFilters.deliveryPromise} onChange={e => setLocalFilters(f => ({...f, deliveryPromise: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-border rounded-md text-sm bg-input focus:outline-none focus:ring-primary-main">
                        <option value="">All</option>
                        {allServiceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-xs font-medium text-muted-foreground">Payment Mode</label>
                    <select value={localFilters.paymentMode} onChange={e => setLocalFilters(f => ({...f, paymentMode: e.target.value}))} className="mt-1 block w-full px-3 py-2 border border-border rounded-md text-sm bg-input focus:outline-none focus:ring-primary-main">
                        <option value="">All</option>
                        {allPaymentModes.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {allStatuses.map(status => (
                            <label key={status} className="flex items-center space-x-2 text-sm">
                                <input type="checkbox" checked={localFilters.orderStatus.includes(status)} onChange={() => handleStatusChange(status)} className="rounded border-border text-primary-main focus:ring-primary-main bg-input" />
                                <span>{status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 border-t border-border pt-4">
                <button onClick={handleClear} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted">Clear</button>
                <button onClick={handleApply} className="px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark">Apply</button>
            </div>
        </div>
    );
};


const OrderHistoryToolbar: React.FC<OrderHistoryToolbarProps> = ({ searchQuery, onSearchChange, filters, onFiltersChange, selectedRowCount, onBulkAction, allColumns, columnVisibility, setColumnVisibility }) => {
    const [isBulkMenuOpen, setBulkMenuOpen] = useState(false);
    const [isColumnMenuOpen, setColumnMenuOpen] = useState(false);
    const [isFilterOpen, setFilterOpen] = useState(false);
    
    const bulkMenuRef = useRef<HTMLDivElement>(null);
    const columnMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) setBulkMenuOpen(false);
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) setColumnMenuOpen(false);
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) setFilterOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = (id: string) => {
        setColumnVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const areFiltersActive = useMemo(() => {
        return filters.awbNumber || filters.deliveryPromise || filters.paymentMode || filters.orderStatus.length > 0 || filters.startDate || filters.endDate;
    }, [filters]);

    const toggleableColumns = allColumns.filter(c => c.id !== 'selection' && c.id !== 'actions');

    return (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-input placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-main focus:border-primary-main sm:text-sm"
                />
            </div>

            <div className="flex items-center gap-2">
                {selectedRowCount > 0 && (
                    <div className="relative" ref={bulkMenuRef}>
                        <button 
                            onClick={() => setBulkMenuOpen(!isBulkMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 border border-primary-main text-primary-main bg-card rounded-lg text-sm font-medium hover:bg-primary-lighter"
                        >
                            {selectedRowCount} selected <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        {isBulkMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                                <ul className="py-1 text-sm text-card-foreground">
                                    <li><button onClick={() => { onBulkAction('Generate Manifest'); setBulkMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted">Generate Manifest</button></li>
                                    <li><button onClick={() => { onBulkAction('Generate Labels'); setBulkMenuOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-muted">Generate Labels</button></li>
                                    <li><button onClick={() => { onBulkAction('Cancel Orders'); setBulkMenuOpen(false); }} className="w-full text-left px-4 py-2 text-error-main hover:bg-muted">Cancel Orders</button></li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative" ref={filterMenuRef}>
                    <button onClick={() => setFilterOpen(!isFilterOpen)} className="relative flex items-center gap-2 px-4 py-2 border border-border text-foreground bg-card rounded-lg text-sm font-medium hover:bg-muted">
                        <FilterIcon className="text-muted-foreground"/> Filters
                        {areFiltersActive && <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-primary-main"></span>}
                    </button>
                     {isFilterOpen && <FilterPopover filters={filters} onFiltersChange={onFiltersChange} onClose={() => setFilterOpen(false)} />}
                </div>
                
                <div className="relative" ref={columnMenuRef}>
                    <button 
                        onClick={() => setColumnMenuOpen(!isColumnMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 border border-border text-foreground bg-card rounded-lg text-sm font-medium hover:bg-muted"
                    >
                        <ViewColumnsIcon className="text-muted-foreground"/> Columns
                    </button>
                     {isColumnMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg z-10 border border-border">
                            <div className="p-2 text-sm font-semibold text-foreground border-b border-border">Toggle Columns</div>
                            <ul className="py-2 px-2 text-sm text-card-foreground grid grid-cols-1 gap-1">
                                {toggleableColumns.map(col => (
                                    <li key={col.id}>
                                        <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={!!columnVisibility[col.id]}
                                                onChange={() => toggleColumn(col.id)}
                                                className="rounded border-border text-primary-main focus:ring-primary-main bg-input"
                                            />
                                            {col.label}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <button className="px-4 py-2 border border-border text-foreground bg-card rounded-lg text-sm font-medium hover:bg-muted">
                    Export
                </button>
            </div>
        </div>
    );
};

export default OrderHistoryToolbar;
