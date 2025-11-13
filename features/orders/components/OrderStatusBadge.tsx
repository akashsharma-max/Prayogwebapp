import React from 'react';
import { OrderStatus } from '../../../types';

const statusConfig: Record<OrderStatus, { text: string; bg: string; }> = {
    'DELIVERED': { text: 'text-success-darker', bg: 'bg-success-lighter' },
    'CONFIRMED': { text: 'text-info-darker', bg: 'bg-info-lighter' },
    'PROCESSING': { text: 'text-info-darker', bg: 'bg-info-lighter' },
    'READY_FOR_DISPATCH': { text: 'text-info-darker', bg: 'bg-info-lighter' },
    'IN_TRANSIT': { text: 'text-warning-darker', bg: 'bg-warning-lighter' },
    'PENDING': { text: 'text-warning-darker', bg: 'bg-warning-lighter' },
    'CANCELLED': { text: 'text-error-darker', bg: 'bg-error-lighter' },
    'FAILED': { text: 'text-error-darker', bg: 'bg-error-lighter' },
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const config = statusConfig[status] || { text: 'text-gray-700', bg: 'bg-gray-200' };
    const formattedStatus = (status || 'PENDING')
        .replace('_', ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');


    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
            {formattedStatus}
        </span>
    );
};

export default OrderStatusBadge;