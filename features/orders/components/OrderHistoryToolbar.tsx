import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, FilterIcon, ChevronDownIcon, ViewColumnsIcon } from '../../../components/icons';

interface OrderHistoryToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedRowCount: number;
    onBulkAction: (action: string) => void;
    allColumns: { id: string; label: string; }[];
    columnVisibility: Record<string, boolean>;
    setColumnVisibility: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const OrderHistoryToolbar: React.FC<OrderHistoryToolbarProps> = ({ searchQuery, onSearchChange, selectedRowCount, onBulkAction, allColumns, columnVisibility, setColumnVisibility }) => {
    const [isBulkMenuOpen, setBulkMenuOpen] = useState(false);
    const [isColumnMenuOpen, setColumnMenuOpen] = useState(false);
    
    const bulkMenuRef = useRef<HTMLDivElement>(null);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkMenuRef.current && !bulkMenuRef.current.contains(event.target as Node)) {
                setBulkMenuOpen(false);
            }
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
                setColumnMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = (id: string) => {
        setColumnVisibility(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground bg-card rounded-lg text-sm font-medium hover:bg-muted">
                    <FilterIcon className="text-muted-foreground"/> Filters
                </button>
                
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