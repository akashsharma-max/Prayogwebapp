
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    SearchIcon, 
    LocationPinIcon, 
    CheckCircleFilledIcon, 
    DocumentTextIcon,
    RefreshIcon,
    TruckIcon,
    BoxIcon,
    PackageIcon,
    CalendarIcon
} from '../../components/icons';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';

// --- Types ---

interface Location {
    city: string;
    state: string;
    pincode: string;
    landmark: string;
}

interface OrderInformation {
    trackingId: string;
    trackingIds: string[];
    orderId: string;
    partnerTracking: any[];
    sourceLocation: Location;
    destinationLocation: Location;
    childTrackingIds: any[];
    parentTrackingId: string;
    type: string;
    movement_type: string;
    pod_links: string[];
    clientId: string;
    createdAt: string;
    updatedAt: string;
    receiverDetails: {
        receiver_mobile: string;
        receiver_name: string;
    };
}

interface StatusEvent {
    trackingId: string;
    status: string;
    category: string;
    subcategory: string;
    statusTimestamp: number;
    location?: string;
    deliveryPartnerName: string;
    event: string;
    movement_type: string;
    createdAt: string;
}

interface TrackingResponse {
    orderInformation: OrderInformation;
    statuses: StatusEvent[];
}

// --- Helper Functions ---

const formatDate = (dateString: string | number) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });
};

const getStatusStep = (category: string = ''): number => {
    const normalized = category.toUpperCase();
    if (normalized === 'DELIVERED') return 4;
    if (normalized === 'OUT_FOR_DELIVERY') return 3;
    if (normalized === 'IN_TRANSIT' || normalized === 'SHIPPED') return 2;
    if (normalized === 'PICKED_UP' || normalized === 'PROCESSING') return 1;
    return 0; // Ordered/Pending
};

// --- Components ---

const StatusStepper: React.FC<{ currentCategory: string }> = ({ currentCategory }) => {
    const currentStep = getStatusStep(currentCategory);
    
    const steps = [
        { label: 'Ordered', icon: BoxIcon },
        { label: 'Picked Up', icon: PackageIcon },
        { label: 'In Transit', icon: TruckIcon },
        { label: 'Out for Delivery', icon: TruckIcon },
        { label: 'Delivered', icon: CheckCircleFilledIcon },
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-border -z-10" />
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-success-main transition-all duration-500 -z-10" 
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                
                {steps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    
                    return (
                        <div key={step.label} className="flex flex-col items-center bg-card px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                                isCompleted 
                                    ? 'bg-success-main border-success-main text-white' 
                                    : 'bg-card border-border text-muted-foreground'
                            }`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-success-main font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const TrackingPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchId, setSearchId] = useState(searchParams.get('trackingId') || '');
    const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const fetchTrackingDetails = useCallback(async (id: string) => {
        setIsLoading(true);
        setTrackingData(null);
        try {
            const response = await apiClient.get(`/gateway/tracking/v2/${id}`);
            if (response && response.orderInformation) {
                setTrackingData(response as TrackingResponse);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch tracking details.";
            addToast(errorMessage, 'error');
            console.error("Tracking Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        const id = searchParams.get('trackingId');
        if (id) {
            setSearchId(id);
            fetchTrackingDetails(id);
        }
    }, [searchParams, fetchTrackingDetails]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchId.trim()) {
            addToast('Please enter a tracking ID', 'error');
            return;
        }
        setSearchParams({ trackingId: searchId });
    };

    const sortedStatuses = trackingData?.statuses 
        ? [...trackingData.statuses].sort((a, b) => b.statusTimestamp - a.statusTimestamp) 
        : [];

    const currentStatus = sortedStatuses.length > 0 ? sortedStatuses[0] : null;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Search Header */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Track Shipment</h1>
                    <p className="text-muted-foreground text-sm">Enter your tracking ID to see real-time updates.</p>
                </div>
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Enter Tracking ID"
                            className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input focus:ring-2 focus:ring-primary-main focus:border-primary-main text-sm text-foreground placeholder-muted-foreground"
                        />
                        <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                    </div>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary-main text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                        {isLoading && <RefreshIcon className="w-4 h-4 animate-rotate mr-2"/>}
                        Track
                    </button>
                </form>
            </div>

            {trackingData && trackingData.orderInformation ? (
                <>
                    {/* Status & Stepper Card */}
                    <div className="bg-card rounded-xl shadow-sm border border-border p-6 animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border pb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-bold text-foreground">
                                        {currentStatus?.category.replace(/_/g, ' ') || 'Unknown Status'}
                                    </h2>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        currentStatus?.category === 'DELIVERED' 
                                            ? 'bg-success-lighter text-success-darker' 
                                            : 'bg-primary-lighter text-primary-darker'
                                    }`}>
                                        {currentStatus?.subcategory || 'Updated recently'}
                                    </span>
                                </div>
                                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <span className="font-medium">Tracking ID:</span> {trackingData.orderInformation.trackingId}
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                    <span className="font-medium">Order ID:</span> {trackingData.orderInformation.orderId || 'N/A'}
                                </p>
                            </div>
                            <div className="text-right mt-4 md:mt-0">
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-lg font-semibold text-foreground">
                                    {currentStatus ? formatDate(currentStatus.statusTimestamp) : 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="px-2 md:px-10 mb-2">
                            <StatusStepper currentCategory={currentStatus?.category || ''} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timeline Section */}
                        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6 animate-fade-in-up delay-100">
                            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center">
                                <TruckIcon className="w-5 h-5 mr-2 text-primary-main" />
                                Shipment Updates
                            </h3>
                            
                            <div className="relative pl-2">
                                {sortedStatuses.map((step, index) => {
                                    const isLast = index === sortedStatuses.length - 1;
                                    const isLatest = index === 0;
                                    
                                    return (
                                        <div key={index} className="flex gap-4 pb-8 relative">
                                            {/* Line */}
                                            {!isLast && (
                                                <div className="absolute left-[9px] top-3 bottom-0 w-0.5 bg-border -z-0"></div>
                                            )}
                                            
                                            {/* Dot */}
                                            <div className={`w-5 h-5 rounded-full border-4 flex-shrink-0 z-10 ${
                                                isLatest 
                                                    ? 'bg-primary-main border-primary-lighter dark:border-primary-darker shadow-sm' 
                                                    : 'bg-muted-foreground border-border'
                                            }`} />
                                            
                                            {/* Content */}
                                            <div className="flex-1 -mt-1">
                                                <p className={`text-sm font-semibold ${isLatest ? 'text-primary-main' : 'text-foreground'}`}>
                                                    {step.category.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-sm text-foreground mt-0.5">{step.subcategory}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                                                    <span>{formatDate(step.statusTimestamp)}</span>
                                                    {step.location && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center">
                                                                <LocationPinIcon className="w-3 h-3 mr-1" />
                                                                {step.location}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {sortedStatuses.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No status updates available yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Sidebar */}
                        <div className="space-y-6 animate-fade-in-up delay-200">
                            {/* Locations Card */}
                            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                                <h3 className="text-lg font-bold text-foreground mb-4">Route Details</h3>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="absolute left-0 top-2 w-3 h-3 border-2 border-primary-main rounded-full bg-card z-10"></div>
                                        <div className="absolute left-[5px] top-4 bottom-[-24px] w-0.5 bg-border border-l border-dashed border-muted-foreground/30"></div>
                                        <div className="pl-6">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
                                            <p className="font-semibold text-foreground text-sm">
                                                {trackingData.orderInformation.sourceLocation.city}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {trackingData.orderInformation.sourceLocation.state}, {trackingData.orderInformation.sourceLocation.pincode}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-0 top-2 w-3 h-3 bg-success-main rounded-full z-10"></div>
                                        <div className="pl-6">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
                                            <p className="font-semibold text-foreground text-sm">
                                                {trackingData.orderInformation.destinationLocation.city}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {trackingData.orderInformation.destinationLocation.state}, {trackingData.orderInformation.destinationLocation.pincode}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Receiver</p>
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {trackingData.orderInformation.receiverDetails.receiver_name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Mobile</p>
                                            <p className="text-sm font-medium text-foreground">
                                                {trackingData.orderInformation.receiverDetails.receiver_mobile || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info Card */}
                            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                                <h3 className="text-lg font-bold text-foreground mb-4">Shipment Info</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Carrier</span>
                                        <span className="text-sm font-medium text-foreground capitalize">
                                            {currentStatus?.deliveryPartnerName || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Type</span>
                                        <span className="text-sm font-medium text-foreground capitalize">
                                            {trackingData.orderInformation.type || 'Standard'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Ordered On</span>
                                        <span className="text-sm font-medium text-foreground">
                                            {formatDate(trackingData.orderInformation.createdAt).split(',')[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* POD Section */}
                                {trackingData.orderInformation.pod_links && trackingData.orderInformation.pod_links.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            Proof of Delivery
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            {trackingData.orderInformation.pod_links.map((link, index) => (
                                                <a 
                                                    key={index}
                                                    href={link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-full px-3 py-2 text-xs font-medium text-primary-main bg-primary-lighter hover:bg-primary-lighter/80 rounded border border-primary-light transition-colors"
                                                >
                                                    View Document {index + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : !isLoading && !trackingData && (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border text-center shadow-sm">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                        <SearchIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Start Tracking</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Enter a valid tracking ID above to see the current status and travel history of your shipment.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrackingPage;
