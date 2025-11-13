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
        <Icon className="w-5 h-5 text-muted-foreground mt-1 mr-3 flex-shrink-0" />
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{children}</p>
        </div>
    </div>
);

const AddressCard: React.FC<{ address: Address }> = ({ address }) => {
    const isPickup = address.type === 'PICKUP';
    return (
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">{isPickup ? 'Pickup Address' : 'Delivery Address'}</h3>
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
            <thead className="bg-muted text-left">
                <tr>
                    <th className="px-4 py-2 font-medium text-muted-foreground">Item</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">SKU</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Quantity</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Unit Price</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {items.map(item => (
                    <tr key={item.id}>
                        <td className="px-4 py-2 font-medium text-foreground">{item.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{item.sku}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ShipmentCard: React.FC<{ shipment: Shipment }> = ({ shipment }) => (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-foreground">Shipment Details</h3>
                <p className="text-sm text-muted-foreground">{shipment.awbNumber}</p>
            </div>
            <OrderStatusBadge status={shipment.shipmentStatus as any} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-b border-border py-4">
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
        <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <CreditCardIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                Payment Details
            </h3>
            <div className="space-y-2 border-t border-border pt-4">
                {payment.breakdown?.otherCharges?.map(charge => (
                    <div key={charge.id} className="flex justify-between items-center text-sm">
                        <p className="text-muted-foreground">{charge.name}</p>
                        <p className="font-medium text-foreground">
                            {charge.chargedAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                    </div>
                ))}
            </div>
            {payment.finalAmount && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border font-bold text-base">
                    <p className="text-foreground">Total Amount</p>
                    <p className="text-primary-main">
                         {payment.finalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </p>
                </div>
            )}
        </div>
    );
};


const OrderDetailsPage: React.FC = () => {
    // FIX: `useParams` was not being called as a function, which caused a type error.
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            setIsLoading(true);
            try {
                const data = await apiClient.get(`/gateway/booking-service/orders/${orderId}`);
                if (data.status === 'success' && data.data) {
                    setOrder(data.data);
                } else if (data.id) {
                    setOrder(data);
                } else {
                    throw new Error(data.message || 'Failed to fetch order details.');
                }
            } catch (error) {
                const errorMessage = error instanceof ApiError ? error.message : "An error occurred while fetching order details.";
                if (error instanceof ApiError && error.status === 404) {
                     addToast(`Order with ID ${orderId} not found.`, 'error');
                } else {
                    addToast(errorMessage, 'error');
                }
                console.error("Fetch error:", error);
                setOrder(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, addToast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-main"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center p-6">
                <h2 className="text-2xl font-semibold text-foreground">Order not found</h2>
                <p className="text-muted-foreground mt-2">The order you are looking for does not exist or could not be loaded.</p>
                <Link to="/orders/view" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark">
                    Back to Order History
                </Link>
            </div>
        );
    }
    
    const pickupAddress = order.addresses.find(a => a.type === 'PICKUP');
    const deliveryAddress = order.addresses.find(a => a.type === 'DELIVERY');

    return (
        <div className="space-y-6">
            <div>
                <Link to="/orders/view" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Order History
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground font-heading">Order #{order.orderId}</h1>
                        <p className="text-muted-foreground">Details for order placed on {formatDate(order.orderDate)}.</p>
                    </div>
                    <OrderStatusBadge status={order.orderStatus} />
                </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Order Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <DetailItem icon={ClipboardListIcon} label="Reference ID">{order.referenceId}</DetailItem>
                    <DetailItem icon={CalendarIcon} label="Expected Delivery">{formatDate(order.expectedDeliveryDate)}</DetailItem>
                    <DetailItem icon={PackageIcon} label="Parcel Category">{order.parcelCategory}</DetailItem>
                    <DetailItem icon={CreditCardIcon} label="Payment Mode">{order.payment?.splitPayments ? 'Split' : 'Full'}</DetailItem>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pickupAddress && <AddressCard address={pickupAddress} />}
                {deliveryAddress && <AddressCard address={deliveryAddress} />}
            </div>
            
            {order.shipments.map(shipment => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
            ))}
            
            {order.payment && <PaymentDetailsCard payment={order.payment} />}
        </div>
    );
};

export default OrderDetailsPage;
