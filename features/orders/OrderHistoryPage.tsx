
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { OrderEntity, OrderStatus } from '../../types';
import OrderHistoryToolbar from './components/OrderHistoryToolbar';
import OrderHistoryTable from './components/OrderHistoryTable';
import OrderPagination from './components/OrderPagination';
import { RefreshIcon } from '../../components/icons';
import { useToast } from '../../App';
import apiClient, { ApiError } from '../../lib/apiClient';

type Filters = {
    awbNumber: string;
    deliveryPromise: string;
    paymentMode: string;
    orderStatus: OrderStatus[];
};

type State = {
    orders: OrderEntity[];
    totalOrders: number;
    isLoading: boolean;
    isBulkLoading: boolean;
    pagination: { pageIndex: number; pageSize: number };
    sorting: { id: string; desc: boolean }[];
    searchQuery: string;
    filters: Filters;
    selectedRowIds: Record<string, boolean>;
};

type Action =
    | { type: 'START_LOADING' }
    | { type: 'SET_DATA'; payload: { orders: OrderEntity[], total: number } }
    | { type: 'SET_PAGINATION'; payload: { pageIndex: number; pageSize: number } }
    | { type: 'SET_SORTING'; payload: { id: string; desc: boolean }[] }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_FILTERS'; payload: Filters }
    | { type: 'SET_SELECTED_ROWS'; payload: Record<string, boolean> }
    | { type: 'START_BULK_ACTION' }
    | { type: 'END_BULK_ACTION' };

const initialState: State = {
    orders: [],
    totalOrders: 0,
    isLoading: true,
    isBulkLoading: false,
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    searchQuery: '',
    filters: {
        awbNumber: '',
        deliveryPromise: '',
        paymentMode: '',
        orderStatus: [],
    },
    selectedRowIds: {},
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'START_LOADING':
            return { ...state, isLoading: true };
        case 'SET_DATA':
            return { ...state, orders: action.payload.orders, totalOrders: action.payload.total, isLoading: false };
        case 'SET_PAGINATION':
            return { ...state, pagination: action.payload };
        case 'SET_SORTING':
            return { ...state, sorting: action.payload };
        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, pageIndex: 0 } };
        case 'SET_FILTERS':
            return { ...state, filters: action.payload, pagination: { ...state.pagination, pageIndex: 0 } };
        case 'SET_SELECTED_ROWS':
            return { ...state, selectedRowIds: action.payload };
        case 'START_BULK_ACTION':
            return { ...state, isBulkLoading: true };
        case 'END_BULK_ACTION':
            return { ...state, isBulkLoading: false, selectedRowIds: {} };
        default:
            return state;
    }
}

// Maps the raw order data from the API to the OrderEntity structure used by the UI
const mapApiDataToOrderEntity = (apiOrder: any): OrderEntity => {
    const shipment = apiOrder.shipments?.[0];
    const dimensions = shipment?.dimensions;
    const deliveryAddress = apiOrder.addresses?.find((a: any) => a.type === 'DELIVERY');

    const weight = shipment?.physicalWeight ? `${shipment.physicalWeight.toFixed(2)}kg` : 'N/A';
    const lbh = dimensions ? `${dimensions.length}x${dimensions.width}x${dimensions.height} cm` : 'N/A';

    return {
        id: String(apiOrder.id),
        orderId: apiOrder.orderId || 'N/A',
        awbNumber: shipment?.awbNumber || 'Not Assigned',
        destinationPincode: deliveryAddress?.zip || 'N/A',
        deliveryPromise: apiOrder.deliveryPromise || 'N/A',
        weight: weight,
        lbh: lbh,
        bookingDate: apiOrder.orderDate || new Date().toISOString(),
        paymentMode: apiOrder.payment?.mode || 'Prepaid', // Defaulting as not present in API
        status: (apiOrder.orderStatus?.toUpperCase().replace(' ', '_') || 'PENDING') as OrderStatus,
        parcelCategory: apiOrder.parcelCategory?.includes('INTERNATIONAL') ? 'INTERNATIONAL' : 'DOMESTIC',
    };
};

// Maps frontend column IDs to backend API field names for sorting
const columnIdToApiSortField: { [key: string]: string } = {
  orderId: 'orderId',
  deliveryPromise: 'deliveryPromise',
  bookingDate: 'orderDate',
  status: 'orderStatus',
};

const allColumns = [
    { id: 'selection', label: '' },
    { id: 'srNo', label: 'Sr. No.' },
    { id: 'awbNumber', label: 'Document Number' },
    { id: 'orderId', label: 'Order ID' },
    { id: 'destinationPincode', label: 'Destination' },
    { id: 'deliveryPromise', label: 'Service Type' },
    { id: 'weight', label: 'Weight / LBH' },
    { id: 'bookingDate', label: 'Date' },
    { id: 'paymentMode', label: 'Payment Mode' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
];

const initialVisibility = allColumns.reduce((acc, col) => {
    acc[col.id] = true;
    return acc;
}, {} as Record<string, boolean>);


const OrderHistoryPage: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { addToast } = useToast();
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialVisibility);

    const fetchData = useCallback(async () => {
        dispatch({ type: 'START_LOADING' });

        try {
            const params = new URLSearchParams();
            params.append('page', String(state.pagination.pageIndex + 1));
            params.append('limit', String(state.pagination.pageSize));

            const sort = state.sorting[0];
            if (sort && columnIdToApiSortField[sort.id]) {
                const apiField = columnIdToApiSortField[sort.id];
                params.append('sort_by', apiField);
                params.append('order', sort.desc ? 'desc' : 'asc');
            }

            const trimmedSearchQuery = state.searchQuery.trim();
            if (trimmedSearchQuery) {
                params.append('orderId', trimmedSearchQuery);
            }

            // Append filters
            if (state.filters.awbNumber) params.append('awbNumber', state.filters.awbNumber);
            if (state.filters.deliveryPromise) params.append('deliveryPromise', state.filters.deliveryPromise);
            if (state.filters.paymentMode) params.append('paymentMode', state.filters.paymentMode);
            if (state.filters.orderStatus.length > 0) params.append('orderStatus', state.filters.orderStatus.join(','));


            const data = await apiClient.get('/gateway/booking-service/orders', params);

            if (data.status !== 'success' || !data.data) {
                throw new Error(data.message || "Invalid API response format");
            }
            
            const rawOrders = data.data || [];
            const total = data.count || 0;
            const mappedOrders: OrderEntity[] = rawOrders.map(mapApiDataToOrderEntity);

            dispatch({ type: 'SET_DATA', payload: { orders: mappedOrders, total: total } });
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch order history.";
            console.error("Fetch error:", error);
            addToast(errorMessage, 'error');
            dispatch({ type: 'SET_DATA', payload: { orders: [], total: 0 } });
        }
    }, [state.pagination, state.sorting, state.searchQuery, state.filters, addToast]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBulkAction = (action: string) => {
        dispatch({ type: 'START_BULK_ACTION' });
        console.log(`Performing ${action} on IDs:`, Object.keys(state.selectedRowIds));
        setTimeout(() => {
            dispatch({ type: 'END_BULK_ACTION' });
            fetchData();
        }, 2000);
    };
    
    return (
        <div>
            {state.isBulkLoading && (
                <div className="fixed inset-0 bg-background bg-opacity-75 flex flex-col items-center justify-center z-50">
                    <RefreshIcon className="w-16 h-16 text-primary-main animate-rotate" />
                    <p className="mt-4 text-lg font-semibold text-foreground">Processing your request...</p>
                </div>
            )}
            
            <div className="bg-card rounded-lg shadow-custom-light border border-border">
                <OrderHistoryToolbar
                    searchQuery={state.searchQuery}
                    onSearchChange={(query) => dispatch({ type: 'SET_SEARCH', payload: query })}
                    filters={state.filters}
                    onFiltersChange={(newFilters) => dispatch({ type: 'SET_FILTERS', payload: newFilters })}
                    selectedRowCount={Object.keys(state.selectedRowIds).length}
                    onBulkAction={handleBulkAction}
                    allColumns={allColumns}
                    columnVisibility={columnVisibility}
                    setColumnVisibility={setColumnVisibility}
                />
                <OrderHistoryTable
                    orders={state.orders}
                    isLoading={state.isLoading}
                    pagination={state.pagination}
                    setPagination={(updater) => {
                        const newPagination = typeof updater === 'function' ? updater(state.pagination) : updater;
                        dispatch({type: 'SET_PAGINATION', payload: newPagination})
                    }}
                    sorting={state.sorting}
                    setSorting={(updater) => {
                         const newSorting = typeof updater === 'function' ? updater(state.sorting) : updater;
                        dispatch({type: 'SET_SORTING', payload: newSorting})
                    }}
                    selectedRowIds={state.selectedRowIds}
                    setSelectedRowIds={(updater) => {
                         const newSelected = typeof updater === 'function' ? updater(state.selectedRowIds) : updater;
                        dispatch({type: 'SET_SELECTED_ROWS', payload: newSelected})
                    }}
                    columnVisibility={columnVisibility}
                />
                <OrderPagination
                    pageIndex={state.pagination.pageIndex}
                    pageSize={state.pagination.pageSize}
                    totalCount={state.totalOrders}
                    setPagination={(updater) => {
                        const newPagination = typeof updater === 'function' ? updater(state.pagination) : updater;
                        dispatch({type: 'SET_PAGINATION', payload: newPagination})
                    }}
                />
            </div>
        </div>
    );
};

export default OrderHistoryPage;