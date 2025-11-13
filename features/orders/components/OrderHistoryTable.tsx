import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrderEntity } from '../../../types';
import { PlaneIcon, MoreVerticalIcon, DownloadIcon, TrashIcon, ExternalLinkIcon, ViewIcon } from '../../../components/icons';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderHistoryTableProps {
    orders: OrderEntity[];
    isLoading: boolean;
    pagination: { pageIndex: number; pageSize: number };
    setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    sorting: { id: string; desc: boolean }[];
    setSorting: React.Dispatch<React.SetStateAction<{ id: string; desc: boolean }[]>>;
    selectedRowIds: Record<string, boolean>;
    setSelectedRowIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    columnVisibility: Record<string, boolean>;
}

const TableHeader: React.FC<{
    id: string;
    label: string;
    isSortable: boolean;
    sorting: { id: string; desc: boolean }[];
    setSorting: React.Dispatch<React.SetStateAction<{ id: string; desc: boolean }[]>>;
    className?: string;
}> = ({ id, label, isSortable, sorting, setSorting, className }) => {
    const currentSort = sorting.find(s => s.id === id);
    const isSorted = !!currentSort;
    const isDesc = isSorted && currentSort.desc;

    const handleSort = () => {
        if (!isSortable) return;
        setSorting([{ id, desc: isSorted ? !isDesc : false }]);
    };

    return (
        <th scope="col" className={`px-4 py-3 ${className || ''}`} onClick={handleSort}>
            <div className={`flex items-center gap-1 ${isSortable ? 'cursor-pointer' : ''}`}>
                {label}
                {isSortable && (
                    <span className="opacity-50">
                        {isSorted ? (isDesc ? '▼' : '▲') : '↕'}
                    </span>
                )}
            </div>
        </th>
    );
};


const RowActions: React.FC<{ order: OrderEntity }> = ({ order }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCancel = () => {
        if (window.confirm(`Are you sure you want to cancel Order ${order.orderId}?`)) {
            alert('Order cancelled!');
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                <MoreVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <ul className="py-1 text-sm text-gray-700">
                        <li><Link to={`/orders/view/${order.orderId}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"> <ViewIcon className="w-4 h-4" /> View</Link></li>
                        <li><a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"> <DownloadIcon className="w-4 h-4" /> Download Invoice</a></li>
                        <li><a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"> <DownloadIcon className="w-4 h-4" /> Download Label</a></li>
                        <li><a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"> <ExternalLinkIcon className="w-4 h-4" /> Track Order</a></li>
                        {order.status === 'CONFIRMED' && (
                             <li><button onClick={handleCancel} className="flex items-center gap-2 w-full text-left px-4 py-2 text-error-main hover:bg-gray-100"> <TrashIcon className="w-4 h-4" /> Cancel Order</button></li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ orders, isLoading, pagination, sorting, setSorting, selectedRowIds, setSelectedRowIds, columnVisibility }) => {
    const pageStart = pagination.pageIndex * pagination.pageSize;

    const toggleRow = (id: string) => {
        setSelectedRowIds(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const toggleAllRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const newSelected: Record<string, boolean> = {};
        if (isChecked) {
            orders.forEach(order => {
                if(order.status === 'CONFIRMED') newSelected[order.id] = true;
            });
        }
        setSelectedRowIds(newSelected);
    };

    const isAllSelected = useMemo(() => {
        const selectableRows = orders.filter(o => o.status === 'CONFIRMED');
        return selectableRows.length > 0 && selectableRows.every(o => selectedRowIds[o.id]);
    }, [orders, selectedRowIds]);

    const visibleColumnCount = Object.values(columnVisibility).filter(Boolean).length;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600 responsive-table">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                    <tr>
                        {columnVisibility.selection && <th scope="col" className="p-4">
                            <input type="checkbox" onChange={toggleAllRows} checked={isAllSelected} className="rounded border-gray-300 text-primary-main focus:ring-primary-main"/>
                        </th>}
                        {columnVisibility.srNo && <TableHeader id="srNo" label="Sr. No." isSortable={false} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.awbNumber && <TableHeader id="awbNumber" label="Document Number" isSortable={true} sorting={sorting} setSorting={setSorting} className="min-w-[180px]"/>}
                        {columnVisibility.orderId && <TableHeader id="orderId" label="Order ID" isSortable={true} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.destinationPincode && <TableHeader id="destinationPincode" label="Destination" isSortable={true} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.deliveryPromise && <TableHeader id="deliveryPromise" label="Service Type" isSortable={true} sorting={sorting} setSorting={setSorting} className="min-w-[120px]"/>}
                        {columnVisibility.weight && <TableHeader id="weight" label="Weight / LBH" isSortable={true} sorting={sorting} setSorting={setSorting} className="min-w-[150px]"/>}
                        {columnVisibility.bookingDate && <TableHeader id="bookingDate" label="Date" isSortable={true} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.paymentMode && <TableHeader id="paymentMode" label="Payment Mode" isSortable={true} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.status && <TableHeader id="status" label="Status" isSortable={true} sorting={sorting} setSorting={setSorting}/>}
                        {columnVisibility.actions && <TableHeader id="actions" label="Actions" isSortable={false} sorting={sorting} setSorting={setSorting}/>}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, i) => (
                            <tr key={i} className="bg-white border-b">
                                <td colSpan={visibleColumnCount} className="p-4">
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={visibleColumnCount} className="text-center py-10 text-gray-500">
                                No orders found.
                            </td>
                        </tr>
                    ) : (
                        orders.map((order, index) => (
                            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                {columnVisibility.selection && <td className="p-4" data-label="">
                                    <input
                                        type="checkbox"
                                        checked={!!selectedRowIds[order.id]}
                                        onChange={() => toggleRow(order.id)}
                                        disabled={order.status !== 'CONFIRMED'}
                                        className="rounded border-gray-300 text-primary-main focus:ring-primary-main disabled:bg-gray-200"
                                    />
                                </td>}
                                {columnVisibility.srNo && <td data-label="Sr. No." className="px-4 py-3 text-gray-500">{pageStart + index + 1}</td>}
                                {columnVisibility.awbNumber && <td data-label="Document Number" className="px-4 py-3 font-medium text-gray-900">
                                    <div className="flex items-center gap-2">
                                        {order.parcelCategory === 'INTERNATIONAL' && <PlaneIcon className="w-4 h-4 text-primary-main" />}
                                        {order.awbNumber}
                                    </div>
                                </td>}
                                {columnVisibility.orderId && <td data-label="Order ID" className="px-4 py-3">{order.orderId}</td>}
                                {columnVisibility.destinationPincode && <td data-label="Destination" className="px-4 py-3">{order.destinationPincode}</td>}
                                {columnVisibility.deliveryPromise && <td data-label="Service Type" className="px-4 py-3">{order.deliveryPromise}</td>}
                                {columnVisibility.weight && <td data-label="Weight / LBH" className="px-4 py-3">
                                    <div>{order.weight}</div>
                                    <div className="text-xs text-gray-400">{order.lbh}</div>
                                </td>}
                                {columnVisibility.bookingDate && <td data-label="Date" className="px-4 py-3">{new Date(order.bookingDate).toLocaleDateString()}</td>}
                                {columnVisibility.paymentMode && <td data-label="Payment Mode" className="px-4 py-3">{order.paymentMode}</td>}
                                {columnVisibility.status && <td data-label="Status" className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>}
                                {columnVisibility.actions && <td data-label="Actions" className="px-4 py-3 text-center"><RowActions order={order} /></td>}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderHistoryTable;