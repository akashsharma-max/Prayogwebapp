import React from 'react';

interface OrderPaginationProps {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    setPagination: (updater: React.SetStateAction<{ pageIndex: number; pageSize: number }>) => void;
}

const OrderPagination: React.FC<OrderPaginationProps> = ({ pageIndex, pageSize, totalCount, setPagination }) => {
    const pageCount = Math.ceil(totalCount / pageSize);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), pageIndex: 0 }));
    };

    const goToPage = (page: number) => {
        setPagination(prev => ({ ...prev, pageIndex: page }));
    };

    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < pageCount - 1;

    return (
        <div className="flex items-center justify-between p-4 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="p-1 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-main bg-input"
                >
                    {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-4">
                <span>
                    {pageIndex * pageSize + 1} - {Math.min((pageIndex + 1) * pageSize, totalCount)} of {totalCount}
                </span>
                <div className="flex items-center gap-1">
                    <button onClick={() => goToPage(0)} disabled={!canPreviousPage} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                        «
                    </button>
                    <button onClick={() => goToPage(pageIndex - 1)} disabled={!canPreviousPage} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                        ‹
                    </button>
                    <button onClick={() => goToPage(pageIndex + 1)} disabled={!canNextPage} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                        ›
                    </button>
                    <button onClick={() => goToPage(pageCount - 1)} disabled={!canNextPage} className="p-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted">
                        »
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderPagination;