import React, { useState, useEffect, ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OrderDetail, Address, Shipment, Item, OrderStatus, Payment } from '../../types';
import OrderStatusBadge from './components/OrderStatusBadge';
import { 
    ArrowLeftIcon,
    CalendarIcon,
    ClipboardListIcon,
    CreditCardIcon,
    LocationPinIcon,
    PackageIcon,
    UserCircleIcon,
} from '../../components/icons';
import { useToast } from '../../App';
import apiClient, { ApiError } from '../../lib/apiClient';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const DetailItem: React.FC<{ icon: React.ElementType; label: string; children: ReactNode }> = ({ icon: Icon, label, children }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{children}</p>
        </div>
    </div>
);

const AddressCard: React.FC<{ address: Address }> = ({ address }) => {
    const isPickup = address.type === 'PICKUP';
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{isPickup ? 'Pickup Address' : 'Delivery Address'}</h3>
            <div className="space-y-4">
                <DetailItem icon={UserCircleIcon} label="Contact Person">{address.name}</DetailItem>
                <DetailItem icon={LocationPinIcon} label="Address">{`${address.street}, ${address.city}, ${address.state} ${address.zip}`}</DetailItem>
            </div>
        </div>
    );
};

const ItemsTable: React.FC<{ items: Item[] }> = ({ items }) => (
    <div className="overflow-x-auto mt-4">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
                <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">Item</th>
                    <th className="px-4 py-2 font-medium text-gray-600">SKU</th>
                    <th className="px-4 py-2 font-medium text-gray-600 text-right">Quantity</th>
                    <th className="px-4 py-2 font-medium text-gray-600 text-right">Unit Price</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                    <tr key={item.id}>
                        <td className="px-4 py-2 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-2 text-gray-500">{item.sku}</td>
                        <td className="px-4 py-2 text-right text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-500">{item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ShipmentCard: React.FC<{ shipment: Shipment }> = ({ shipment }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-gray-800">Shipment Details</h3>
                <p className="text-sm text-gray-500">{shipment.awbNumber}</p>
            </div>
            <OrderStatusBadge status={shipment.shipmentStatus as any} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-b py-4">
            <DetailItem icon={PackageIcon} label="Physical Weight">{shipment.physicalWeight} kg</DetailItem>
            <DetailItem icon={PackageIcon} label="Volumetric Weight">{shipment.volumetricWeight} kg</DetailItem>
            <DetailItem icon={PackageIcon} label="Dimensions">{`${shipment.dimensions.length}x${shipment.dimensions.width}x${shipment.dimensions.height} ${shipment.dimensions.unit}`}</DetailItem>
            <DetailItem icon={ClipboardListIcon} label="Note">{shipment.note || 'N/A'}</DetailItem>
        </div>
        {shipment.items && shipment.items.length > 0 && <ItemsTable items={shipment.items} />}
    </div>
);

const PaymentDetailsCard: React.FC<{ payment: Payment }> = ({ payment }) => {
    if (!payment || (!payment.finalAmount && !payment.breakdown?.otherCharges?.length)) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-3 text-gray-400" />
                Payment Details
            </h3>
            <div className="space-y-2 border-t pt-4">
                {payment.breakdown?.otherCharges?.map(charge => (
                    <div key={charge.id} className="flex justify-between items-center text-sm">
                        <p className="text-gray-600">{charge.name}</p>
                        <p className="font-medium text-gray-800">
                            {charge.chargedAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                    </div>
                ))}
            </div>
            {payment.finalAmount && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t font-bold text-base">
                    <p className="text-gray-800">Total Amount</p>
                    <p className="text-primary-main">
                         {payment.finalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </p>
                </div>
            )}
        </div>
    );
};


const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError("Order ID is missing.");
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const data = await apiClient.get(`/gateway/booking-service/orders/${orderId}`);
                
                if (data.status !== 'success' || !data.data) {
                    throw new Error(data.message || "Invalid API response format");
                }
                
                setOrder(data.data);

            } catch (err: any) {
                const errorMessage = err instanceof ApiError ? err.message : "Failed to fetch order details.";
                console.error("Fetch details error:", err);
                setError(errorMessage);
                addToast(errorMessage, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, addToast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-main"></div>
            </div>
        );
    }
    
    if (error && !order) { // Only show full-page error if no data is loaded
        return (
             <div className="p-6 text-center bg-error-lighter text-error-darker rounded-lg">
                <h3 className="font-bold">Failed to load order details</h3>
                <p>{error}</p>
                 <Link to="/orders/view" className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-error-main hover:bg-error-dark">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Orders
                </Link>
            </div>
        );
    }

    if (!order) {
        return <div className="p-6 text-center text-gray-500">Order not found.</div>;
    }

    const pickupAddress = order.addresses && order.addresses.find(a => a.type === 'PICKUP');
    const deliveryAddress = order.addresses && order.addresses.find(a => a.type === 'DELIVERY');

    return (
        <div className="space-y-6">
            <Link to="/orders/view" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Orders
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 font-heading">
                    Order <span className="text-primary-main">#{order.orderId}</span>
                </h1>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-lg shadow-sm border">
                <DetailItem icon={ClipboardListIcon} label="Reference ID">{order.referenceId}</DetailItem>
                <DetailItem icon={CalendarIcon} label="Order Date">{formatDate(order.orderDate)}</DetailItem>
                <DetailItem icon={CalendarIcon} label="Expected Delivery">{formatDate(order.expectedDeliveryDate)}</DetailItem>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pickupAddress && <AddressCard address={pickupAddress} />}
                {deliveryAddress && <AddressCard address={deliveryAddress} />}
            </div>

            {order.payment && <PaymentDetailsCard payment={order.payment} />}

            <div className="space-y-6">
                {order.shipments && order.shipments.map(shipment => (
                    <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
            </div>
        </div>
    );
};

export default OrderDetailsPage;