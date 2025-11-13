import React from 'react';
import { OrderStatus } from '../../../types';

// Updated config with dark mode variants
const statusConfig = {
    'DELIVERED': 'bg-success-lighter text-success-darker dark:bg-success-darker dark:text-success-light',
    'CONFIRMED': 'bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light',
    'PROCESSING': 'bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light',
    'READY_FOR_DISPATCH': 'bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light',
    'IN_TRANSIT': 'bg-warning-lighter text-warning-darker dark:bg-warning-darker dark:text-warning-light',
    'PENDING': 'bg-warning-lighter text-warning-darker dark:bg-warning-darker dark:text-warning-light',
    'CANCELLED': 'bg-error-lighter text-error-darker dark:bg-error-darker dark:text-error-light',
    'FAILED': 'bg-error-lighter text-error-darker dark:bg-error-darker dark:text-error-light',
    'DEFAULT': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
    const configClasses = statusConfig[status] || statusConfig['DEFAULT'];
    
    const formattedStatus = (status || 'PENDING')
        .replace('_', ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');


    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${configClasses}`}>
            {formattedStatus}
        </span>
    );
};

export default OrderStatusBadge;