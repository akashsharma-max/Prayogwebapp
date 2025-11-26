
import React, { useState, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, BoxIcon, DocumentTextIcon, CurrencyDollarIcon, PlusCircleIcon, MinusCircleIcon, RefreshIcon, CheckCircleIcon, XCircleIcon } from '../../components/icons';
import { useToast } from '../../App';
import apiClient, { ApiError } from '../../lib/apiClient';

const SectionCard: React.FC<{ icon: React.ElementType, title: string, children: ReactNode, className?: string }> = ({ icon: Icon, title, children, className }) => (
    <div className={`bg-card rounded-lg shadow-sm border border-border ${className}`}>
        <div className="p-4 border-b border-border flex items-center">
            <Icon className="w-6 h-6 mr-3 text-primary-main" />
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const FormField: React.FC<{ label: string, name: string, required?: boolean, error?: string, children: ReactNode }> = ({ label, name, required, error, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-1">
            {label} {required && <span className="text-error-main">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-error-main mt-1">{error}</p>}
    </div>
);

// State interfaces
interface Product { id: number; type: string; name: string; value: string; quantity: string; }
interface Shipment { id: number; weight: string; length: string; breadth: string; height: string; }
interface UploadedDocument { url: string; type: string; fileName: string; }

interface FormState {
    senderName: string; senderPhone: string; senderAddress: string; senderPincode: string; senderGst: string; senderEmail: string;
    receiverName: string; receiverPhone: string; receiverAddress: string; receiverPincode: string; receiverEmail: string;
    products: Product[];
    shipments: Shipment[];
    documentNumber: string; serviceType: string; cod: boolean; insurance: boolean;
    ewayBill: string; remarks: string;
    addedEwayBills: string[];
    uploadedDocuments: UploadedDocument[];
}
type FormErrors = { [K in keyof FormState]?: string | any };

interface RateDetails {
    baseRate: number;
    totalAmount: number;
    charges: { chargeName: string; amount: number; }[];
    weightCalculation: { finalWeight: number; };
}

interface PincodeDetails {
    from: { city: string; state: string; country: string; };
    to: { city: string; state: string; country: string; };
}

// Debounce utility
function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function executedFunction(...args: Parameters<F>) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}


const initialProduct: Product = { id: Date.now(), type: '', name: '', value: '', quantity: '1' };
const initialShipment: Shipment = { id: Date.now(), weight: '', length: '', breadth: '', height: '' };

const getValidationErrors = (formData: FormState): FormErrors => {
    const newErrors: FormErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const pincodeRegex = /^[0-9]{6}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

    // Sender
    if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required.';
    if (!formData.senderPhone.trim()) {
        newErrors.senderPhone = 'Sender phone is required.';
    } else if (!phoneRegex.test(formData.senderPhone)) {
        newErrors.senderPhone = 'Must be a valid 10-digit phone number.';
    }
    if (!formData.senderAddress.trim()) newErrors.senderAddress = 'Sender address is required.';
    if (!formData.senderPincode.trim()) {
        newErrors.senderPincode = 'Sender pincode is required.';
    } else if (!pincodeRegex.test(formData.senderPincode)) {
        newErrors.senderPincode = 'Must be a valid 6-digit pincode.';
    }
    if (formData.senderEmail.trim() && !emailRegex.test(formData.senderEmail)) {
        newErrors.senderEmail = 'Invalid email format.';
    }
    if (formData.senderGst.trim() && !gstRegex.test(formData.senderGst.toUpperCase())) {
        newErrors.senderGst = 'Invalid GST number format.';
    }

    // Receiver
    if (!formData.receiverName.trim()) newErrors.receiverName = 'Receiver name is required.';
    if (!formData.receiverPhone.trim()) {
        newErrors.receiverPhone = 'Receiver phone is required.';
    } else if (!phoneRegex.test(formData.receiverPhone)) {
        newErrors.receiverPhone = 'Must be a valid 10-digit phone number.';
    }
    if (!formData.receiverAddress.trim()) newErrors.receiverAddress = 'Receiver address is required.';
    if (!formData.receiverPincode.trim()) {
        newErrors.receiverPincode = 'Receiver pincode is required.';
    } else if (!pincodeRegex.test(formData.receiverPincode)) {
        newErrors.receiverPincode = 'Must be a valid 6-digit pincode.';
    }
    if (formData.receiverEmail.trim() && !emailRegex.test(formData.receiverEmail)) {
        newErrors.receiverEmail = 'Invalid email format.';
    }
    
    const productErrors = formData.products.map(p => {
        const err: Partial<Product> & { _error?: boolean } = {};
        if (!p.name.trim()) err.name = 'Required';
        if (!p.value.trim() || parseFloat(p.value) <= 0) err.value = 'Must be > 0';
        if (!p.quantity.trim() || parseInt(p.quantity, 10) <= 0) err.quantity = 'Must be > 0';
        if (Object.keys(err).length > 0) err._error = true;
        return err;
    });

    if (productErrors.some(e => e._error)) {
        newErrors.products = productErrors;
    }
    
    const shipmentErrors = formData.shipments.map(s => {
        const err: Partial<Shipment> & { _error?: boolean } = {};
        if (!s.weight.trim() || parseFloat(s.weight) <= 0) err.weight = 'Must be > 0';
        if (!s.length.trim() || parseFloat(s.length) <= 0) err.length = 'Must be > 0';
        if (!s.breadth.trim() || parseFloat(s.breadth) <= 0) err.breadth = 'Must be > 0';
        if (!s.height.trim() || parseFloat(s.height) <= 0) err.height = 'Must be > 0';
        if (Object.keys(err).length > 0) err._error = true;
        return err;
    });

    if (shipmentErrors.some(e => e._error)) {
        newErrors.shipments = shipmentErrors;
    }
    
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required.';

    return newErrors;
};

const formatMatrixKey = (key: string) => {
    if (!key) return '';
    const spaced = key.replace(/([A-Z])/g, ' $1');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};


const CreateOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormState>({
        senderName: '', senderPhone: '', senderAddress: '', senderPincode: '', senderGst: '', senderEmail: '',
        receiverName: '', receiverPhone: '', receiverAddress: '', receiverPincode: '', receiverEmail: '',
        products: [initialProduct],
        shipments: [initialShipment],
        documentNumber: '', serviceType: '', cod: false, insurance: false,
        ewayBill: '', remarks: '',
        addedEwayBills: [],
        uploadedDocuments: []
    });
    
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [isServiceLoading, setIsServiceLoading] = useState(true);
    const [rateDetails, setRateDetails] = useState<RateDetails | null>(null);
    const [isCalculatingRate, setIsCalculatingRate] = useState(false);
    const [pincodeDetails, setPincodeDetails] = useState<PincodeDetails | null>(null);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isVerifyingEwayBill, setIsVerifyingEwayBill] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [serviceability, setServiceability] = useState<{
        status: 'idle' | 'loading' | 'success' | 'error';
        message: string | null;
    }>({ status: 'idle', message: null });
    const { addToast } = useToast();

    useEffect(() => {
        const fetchServiceTypes = async () => {
            setIsServiceLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('productType', 'COURIER');
                const responseData = await apiClient.get('/gateway/ure/api/matrices/by-tenant', params);

                if (Array.isArray(responseData)) {
                    const types = responseData.map((item: any) => item.matrixKey);
                    if (types.length === 0) {
                       addToast('No service types available. Using defaults.', 'error');
                       setServiceTypes(['Standard', 'Express']);
                       setFormData(prev => ({ ...prev, serviceType: 'Standard' }));
                    } else {
                       setServiceTypes(types);
                       setFormData(prev => ({ ...prev, serviceType: types[0] }));
                    }
                } else {
                    throw new Error("Invalid response format for service types.");
                }
            } catch (error) {
                console.error("Failed to fetch service types:", error);
                addToast('Could not load service types. Using default options.', 'error');
                setServiceTypes(['Standard', 'Express']); // Fallback
                setFormData(prev => ({ ...prev, serviceType: 'Standard' }));
            } finally {
                setIsServiceLoading(false);
            }
        };

        fetchServiceTypes();
    }, [addToast]);
    
    const calculateRates = useCallback(async (currentFormData: FormState) => {
        const firstShipment = currentFormData.shipments[0];
        setIsCalculatingRate(true);
        setRateDetails(null);
        setPincodeDetails(null);
        try {
            const payload = {
                fromPincode: parseInt(currentFormData.senderPincode, 10),
                toPincode: parseInt(currentFormData.receiverPincode, 10),
                serviceType: currentFormData.serviceType,
                weight: Math.round((parseFloat(firstShipment.weight) || 0) * 1000), // kg to g
                length: parseFloat(firstShipment.length) || 0,
                height: parseFloat(firstShipment.height) || 0,
                width: parseFloat(firstShipment.breadth) || 0, // form 'breadth' to api 'width'
                includeDefaultCharges: false,
                userOptions: {
                    insurance: {
                        enabled: currentFormData.insurance,
                        amount: currentFormData.products.reduce((total, p) => {
                            const value = parseFloat(p.value) || 0;
                            const quantity = parseInt(p.quantity, 10) || 0;
                            return total + (value * quantity);
                        }, 0)
                    },
                    cod: currentFormData.cod
                }
            };
            
            const response = await apiClient.post('/gateway/ure/api/external/rate-calculation/calculate', payload);
            if (response.status === 'success' && response.data) {
                setRateDetails(response.data);
                setPincodeDetails(response.data.pincodeDetails);
            } else {
                throw new Error(response.message || 'Failed to calculate rates.');
            }
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "Rate calculation failed.";
            addToast(errorMessage, 'error');
            console.error('Rate calculation error:', error);
            setRateDetails(null);
            setPincodeDetails(null);
        } finally {
            setIsCalculatingRate(false);
        }
    }, [addToast]);

    const debouncedCalculateRates = useMemo(() => debounce(calculateRates, 700), [calculateRates]);

    const checkServiceability = useCallback(async (senderPincode: string, receiverPincode: string) => {
        setServiceability({ status: 'loading', message: null });
        try {
            const payload = {
                source_postal_code: senderPincode,
                destination_postal_code: receiverPincode,
                parcel_category: 'courier',
            };
            const response = await apiClient.post('/serviceability/v2/check', payload);
    
            const hasPartners = response?.success && Array.isArray(response.partners) && response.partners.length > 0;
    
            if (hasPartners) {
                addToast('Pincodes are serviceable.', 'success');
                setServiceability({ status: 'success', message: null });
            } else {
                setServiceability({ status: 'error', message: 'This pincode combination is not serviceable.' });
            }
        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "Failed to check pincode serviceability.";
            setServiceability({ status: 'error', message: errorMessage });
            console.error('Serviceability check error:', error);
        }
    }, [addToast]);
    
    const debouncedCheckServiceability = useMemo(() => debounce(checkServiceability, 500), [checkServiceability]);
    
    useEffect(() => {
        const senderPincodeValid = /^[0-9]{6}$/.test(formData.senderPincode);
        const receiverPincodeValid = /^[0-9]{6}$/.test(formData.receiverPincode);

        if (senderPincodeValid && receiverPincodeValid) {
            debouncedCheckServiceability(formData.senderPincode, formData.receiverPincode);
        } else {
            setServiceability({ status: 'idle', message: null });
        }
    }, [formData.senderPincode, formData.receiverPincode, debouncedCheckServiceability]);

    useEffect(() => {
        const firstShipment = formData.shipments[0];
        const isReadyForCalculation =
            /^[0-9]{6}$/.test(formData.senderPincode) &&
            /^[0-9]{6}$/.test(formData.receiverPincode) &&
            serviceability.status === 'success' &&
            formData.serviceType &&
            firstShipment &&
            !isNaN(parseFloat(firstShipment.weight)) && parseFloat(firstShipment.weight) > 0 &&
            !isNaN(parseFloat(firstShipment.length)) && parseFloat(firstShipment.length) > 0 &&
            !isNaN(parseFloat(firstShipment.breadth)) && parseFloat(firstShipment.breadth) > 0 &&
            !isNaN(parseFloat(firstShipment.height)) && parseFloat(firstShipment.height) > 0;

        if (isReadyForCalculation) {
            debouncedCalculateRates(formData);
        } else {
            setRateDetails(null);
            setPincodeDetails(null);
        }
    }, [formData, debouncedCalculateRates, serviceability.status]);


    const errors = useMemo(() => getValidationErrors(formData), [formData]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProductChange = (index: number, field: keyof Product, value: string) => {
        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setFormData(prev => ({ ...prev, products: newProducts }));
    };

    const handleShipmentChange = (index: number, field: keyof Shipment, value: string) => {
        const newShipments = [...formData.shipments];
        newShipments[index] = { ...newShipments[index], [field]: value };
        setFormData(prev => ({ ...prev, shipments: newShipments }));
    };

    const addProduct = () => setFormData(p => ({ ...p, products: [...p.products, { ...initialProduct, id: Date.now() }] }));
    const removeProduct = (index: number) => setFormData(p => ({ ...p, products: p.products.filter((_, i) => i !== index) }));
    
    const addShipment = () => setFormData(p => ({ ...p, shipments: [...p.shipments, { ...initialShipment, id: Date.now() }] }));
    const removeShipment = (index: number) => setFormData(p => ({ ...p, shipments: p.shipments.filter((_, i) => i !== index) }));

    const handleAddEwayBill = async () => {
        const ewbNo = formData.ewayBill.trim();
        if (!ewbNo) return;
        
        if (formData.addedEwayBills.includes(ewbNo)) {
            addToast('E-Way Bill already added.', 'error');
            return;
        }
    
        setIsVerifyingEwayBill(true);
        try {
            const response = await apiClient.get(`/gateway/ewaybill/${ewbNo}`);
            
            if (response.status === true && response.data) {
                 if (response.data.isEwaybillValid) {
                     setFormData(prev => ({
                         ...prev,
                         addedEwayBills: [...prev.addedEwayBills, ewbNo],
                         ewayBill: '' // Clear input
                     }));
                     addToast('E-Way Bill added successfully.', 'success');
                 } else {
                     const expiry = response.data.validUpto || 'Unknown date';
                     addToast(`E-Way Bill expired or invalid. Valid upto: ${expiry}`, 'error');
                 }
            } else {
                 throw new Error(response.message || 'Invalid E-Way Bill response');
            }
        } catch (error) {
             const msg = error instanceof ApiError ? error.message : "Failed to verify E-Way Bill";
             addToast(msg, 'error');
        } finally {
            setIsVerifyingEwayBill(false);
        }
    };
    
    const handleRemoveEwayBill = (index: number) => {
        setFormData(prev => ({
            ...prev,
            addedEwayBills: prev.addedEwayBills.filter((_, i) => i !== index)
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const uploadData = new FormData();
            uploadData.append('files', file);
            uploadData.append('fileType', file.type);
            uploadData.append('path', 'prayog/uploads/');

            setIsUploading(true);
            try {
                const response = await apiClient.upload('/gateway/file-service/upload', uploadData);
                if (response.status === 200 && response.data && response.data.length > 0) {
                     const uploadedFile = response.data[0];
                     setFormData(prev => ({
                         ...prev,
                         uploadedDocuments: [...prev.uploadedDocuments, {
                             url: uploadedFile.url,
                             type: file.type,
                             fileName: uploadedFile.originalFileName || file.name
                         }]
                     }));
                     addToast('File uploaded successfully', 'success');
                } else {
                     throw new Error(response.message || 'Upload failed');
                }
            } catch (error) {
                console.error(error);
                addToast('Failed to upload file', 'error');
            } finally {
                setIsUploading(false);
                e.target.value = ''; // Reset input to allow re-uploading the same file
            }
        }
    };

    const removeDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            uploadedDocuments: prev.uploadedDocuments.filter((_, i) => i !== index)
        }));
    };

    const calculateVolumetricWeight = (shipment: Shipment) => {
        const { length, breadth, height } = shipment;
        if (length && breadth && height) {
            return ((parseFloat(length) * parseFloat(breadth) * parseFloat(height)) / 5000);
        }
        return 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        if (serviceability.status === 'error') {
            addToast('Cannot create order. The pincode combination is not serviceable.', 'error');
            return;
        }

        const currentErrors = getValidationErrors(formData);
        if (Object.keys(currentErrors).length > 0) {
            addToast('Please fix the errors before submitting.', 'error');
            return;
        }

        if (!rateDetails || !pincodeDetails) {
            addToast('Rate calculation is not complete. Please wait or check your inputs.', 'error');
            return;
        }

        setIsCreatingOrder(true);
        try {
            const buildAddress = (type: string, details: any, pincodeInfo: any) => ({
                type,
                zip: details.pincode,
                name: details.name,
                phone: details.phone,
                email: details.email || '',
                street: details.address,
                landmark: "",
                city: pincodeInfo.city,
                state: pincodeInfo.state,
                country: pincodeInfo.country || 'India',
                latitude: 0,
                longitude: 0,
                addressName: details.address,
            });
            
            const senderInfo = { name: formData.senderName, phone: formData.senderPhone, email: formData.senderEmail, address: formData.senderAddress, pincode: formData.senderPincode };
            const receiverInfo = { name: formData.receiverName, phone: formData.receiverPhone, email: formData.receiverEmail, address: formData.receiverAddress, pincode: formData.receiverPincode };

            const createOrderPayload = {
                orderDate: new Date().toISOString(),
                orderType: "FORWARD",
                orderStatus: "CONFIRMED",
                parcelCategory: "COURIER",
                deliveryPromise: formData.serviceType,
                metadata: { source: "WEB_APP" },
                eWaybills: formData.addedEwayBills,
                documents: formData.uploadedDocuments.map(doc => ({
                    type: doc.type,
                    url: doc.url
                })),
                addresses: [
                    buildAddress("PICKUP", senderInfo, pincodeDetails.from),
                    buildAddress("DELIVERY", receiverInfo, pincodeDetails.to),
                    buildAddress("BILLING", receiverInfo, pincodeDetails.to),
                    buildAddress("RETURN", senderInfo, pincodeDetails.from),
                ],
                shipments: formData.shipments.map(shipment => ({
                    dimensions: {
                        length: parseFloat(shipment.length),
                        width: parseFloat(shipment.breadth),
                        height: parseFloat(shipment.height),
                    },
                    shipmentStatus: "CONFIRMED",
                    awbNumber: "",
                    physicalWeight: parseFloat(shipment.weight),
                    volumetricWeight: calculateVolumetricWeight(shipment),
                    note: formData.remarks || "",
                    items: formData.products.map(product => ({
                        name: product.name,
                        quantity: parseInt(product.quantity, 10),
                        unitPrice: parseFloat(product.value),
                        sku: "",
                        hsnCode: "",
                        description: product.type || "General Goods",
                        taxes: [],
                        discounts: [],
                    })),
                })),
                payment: {
                    finalAmount: rateDetails.totalAmount,
                    type: "",
                    breakdown: {
                        otherCharges: [
                            { name: "Base Rate", chargedAmount: rateDetails.baseRate },
                            ...rateDetails.charges.map(charge => ({
                                name: charge.chargeName,
                                chargedAmount: charge.amount
                            }))
                        ]
                    }
                }
            };
            
            const response = await apiClient.post('/gateway/booking-service/orders', createOrderPayload);
            
            if (response.status === 'success' && response.data?.orderId) {
                const awb = response.data.shipments?.[0]?.awbNumber || 'N/A';
                addToast(`Order created successfully! AWB: ${awb}`, 'success');
                navigate(`/orders/view/${response.data.orderId}`);
            } else if (response.id && response.orderId) { 
                const awb = response.shipments?.[0]?.awbNumber || 'N/A';
                addToast(`Order created successfully! AWB: ${awb}`, 'success');
                navigate(`/orders/view/${response.orderId}`);
            }
            else {
                throw new Error(response.message || 'Failed to create order. Invalid response from server.');
            }

        } catch (error) {
            const errorMessage = error instanceof ApiError ? error.message : "An error occurred while creating the order.";
            addToast(errorMessage, 'error');
            console.error("Create Order Error:", error);
        } finally {
            setIsCreatingOrder(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <SectionCard icon={TruckIcon} title="Sender & Receiver Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground border-b border-border pb-2">Sender Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Name" name="senderName" required error={hasAttemptedSubmit ? errors.senderName : undefined}>
                                        <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Phone Number" name="senderPhone" required error={hasAttemptedSubmit ? errors.senderPhone : undefined}>
                                        <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Pincode" name="senderPincode" required error={hasAttemptedSubmit ? errors.senderPincode : undefined}>
                                        <input type="text" name="senderPincode" value={formData.senderPincode} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Address" name="senderAddress" required error={hasAttemptedSubmit ? errors.senderAddress : undefined}>
                                        <input type="text" name="senderAddress" value={formData.senderAddress} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Email" name="senderEmail" error={hasAttemptedSubmit ? errors.senderEmail : undefined}>
                                        <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="GST Number" name="senderGst" error={hasAttemptedSubmit ? errors.senderGst : undefined}>
                                        <input type="text" name="senderGst" value={formData.senderGst} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground border-b border-border pb-2">Receiver Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Name" name="receiverName" required error={hasAttemptedSubmit ? errors.receiverName : undefined}>
                                        <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Phone Number" name="receiverPhone" required error={hasAttemptedSubmit ? errors.receiverPhone : undefined}>
                                        <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Pincode" name="receiverPincode" required error={hasAttemptedSubmit ? errors.receiverPincode : undefined}>
                                        <input type="text" name="receiverPincode" value={formData.receiverPincode} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Address" name="receiverAddress" required error={hasAttemptedSubmit ? errors.receiverAddress : undefined}>
                                        <input type="text" name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Email" name="receiverEmail" error={hasAttemptedSubmit ? errors.receiverEmail : undefined}>
                                        <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                            </div>
                        </div>
                        {serviceability.status !== 'idle' && (serviceability.status === 'loading' || (serviceability.status === 'error' && serviceability.message)) && (
                            <div className="mt-4 p-3 rounded-md flex items-center gap-3 text-sm border">
                                {serviceability.status === 'loading' && (
                                    <>
                                        <RefreshIcon className="w-5 h-5 animate-rotate text-muted-foreground" />
                                        <span className="text-muted-foreground">Checking pincode serviceability...</span>
                                    </>
                                )}
                                {serviceability.status === 'error' && serviceability.message && (
                                    <>
                                        <XCircleIcon className="w-5 h-5 text-error-main" />
                                        <span className="text-error-darker">{serviceability.message}</span>
                                    </>
                                )}
                            </div>
                        )}
                    </SectionCard>
                    
                    <SectionCard icon={BoxIcon} title="Order Items">
                        {formData.products.map((product, index) => (
                            <div key={product.id} className="grid grid-cols-12 gap-4 items-start mb-4 p-2 border border-border rounded-md">
                                <div className="col-span-12 sm:col-span-3">
                                    <FormField label="Product Type" name={`ptype-${index}`}>
                                        <select value={product.type} onChange={e => handleProductChange(index, 'type', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main">
                                            <option value="">Select Type</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Apparel">Apparel</option>
                                            <option value="Documents">Documents</option>
                                        </select>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-3">
                                    <FormField label="Product Name" name={`pname-${index}`} required error={hasAttemptedSubmit ? errors.products?.[index]?.name : undefined}>
                                        <input type="text" value={product.name} onChange={e => handleProductChange(index, 'name', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-2">
                                    <FormField label="Value (₹)" name={`pvalue-${index}`} required error={hasAttemptedSubmit ? errors.products?.[index]?.value : undefined}>
                                        <input type="number" value={product.value} onChange={e => handleProductChange(index, 'value', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-2">
                                    <FormField label="Quantity" name={`pqty-${index}`} required error={hasAttemptedSubmit ? errors.products?.[index]?.quantity : undefined}>
                                        <input type="number" value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-2 flex items-end h-full">
                                {formData.products.length > 1 && (
                                        <button type="button" onClick={() => removeProduct(index)} className="p-2 text-error-main hover:text-error-dark">
                                            <MinusCircleIcon className="w-6 h-6"/>
                                        </button>
                                )}
                                {index === formData.products.length - 1 && (
                                        <button type="button" onClick={addProduct} className="p-2 text-primary-main hover:text-primary-dark">
                                            <PlusCircleIcon className="w-6 h-6"/>
                                        </button>
                                )}
                                </div>
                            </div>
                        ))}
                    </SectionCard>

                    <SectionCard icon={BoxIcon} title="Shipment Details">
                        {formData.shipments.map((shipment, index) => (
                            <div key={shipment.id} className="mb-4 p-4 border border-border rounded-md">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-foreground">{index === 0 ? "Parent Shipment" : `Child Shipment ${index}`}</h4>
                                    {index > 0 && (
                                        <button type="button" onClick={() => removeShipment(index)} className="text-error-main hover:text-error-dark">
                                            <MinusCircleIcon className="w-6 h-6"/>
                                        </button>
                                )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <FormField label="Physical Weight (kg)" name={`sweight-${index}`} required error={hasAttemptedSubmit ? errors.shipments?.[index]?.weight : undefined}>
                                        <input type="number" step="0.01" value={shipment.weight} onChange={e => handleShipmentChange(index, 'weight', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Length (cm)" name={`slen-${index}`} required error={hasAttemptedSubmit ? errors.shipments?.[index]?.length : undefined}>
                                        <input type="number" step="0.01" value={shipment.length} onChange={e => handleShipmentChange(index, 'length', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Breadth (cm)" name={`sbreadth-${index}`} required error={hasAttemptedSubmit ? errors.shipments?.[index]?.breadth : undefined}>
                                        <input type="number" step="0.01" value={shipment.breadth} onChange={e => handleShipmentChange(index, 'breadth', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Height (cm)" name={`sheight-${index}`} required error={hasAttemptedSubmit ? errors.shipments?.[index]?.height : undefined}>
                                        <input type="number" step="0.01" value={shipment.height} onChange={e => handleShipmentChange(index, 'height', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <p className="text-sm mt-2 text-muted-foreground">Volumetric Weight: <span className="font-bold text-foreground">{calculateVolumetricWeight(shipment).toFixed(2)} kg</span></p>
                            </div>
                        ))}
                        <button type="button" onClick={addShipment} className="mt-2 flex items-center gap-2 text-sm text-primary-main font-medium">
                            <PlusCircleIcon className="w-5 h-5" /> Add Child Shipment
                        </button>
                    </SectionCard>

                    <SectionCard icon={DocumentTextIcon} title="Other Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Service Type" name="serviceType" required error={hasAttemptedSubmit ? errors.serviceType : undefined}>
                                <select 
                                    name="serviceType" 
                                    value={formData.serviceType} 
                                    onChange={handleInputChange} 
                                    disabled={isServiceLoading}
                                    className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main disabled:bg-muted disabled:cursor-not-allowed"
                                >
                                    {isServiceLoading ? (
                                        <option>Loading services...</option>
                                    ) : (
                                        serviceTypes.map(type => (
                                            <option key={type} value={type}>
                                                {formatMatrixKey(type)}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </FormField>
                            <FormField label="E-way Bill Number" name="ewayBill">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        name="ewayBill" 
                                        value={formData.ewayBill} 
                                        onChange={handleInputChange} 
                                        className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"
                                        placeholder="Enter E-Way Bill No"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddEwayBill();
                                            }
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddEwayBill}
                                        disabled={isVerifyingEwayBill || !formData.ewayBill.trim()}
                                        className="px-4 py-2 bg-primary-main text-white rounded-md hover:bg-primary-dark disabled:bg-muted disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isVerifyingEwayBill ? <RefreshIcon className="animate-rotate w-4 h-4"/> : 'Add'}
                                    </button>
                                </div>
                                {formData.addedEwayBills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.addedEwayBills.map((bill, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-primary-lighter text-primary-darker px-2 py-1 rounded-md text-sm">
                                                <span>{bill}</span>
                                                <button type="button" onClick={() => handleRemoveEwayBill(index)} className="text-primary-darker hover:text-red-600">
                                                    <XCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormField>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Additional Services</label>
                                <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2"><input type="checkbox" name="cod" checked={formData.cod} onChange={handleInputChange} className="rounded border-border"/> COD</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="insurance" checked={formData.insurance} onChange={handleInputChange} className="rounded border-border"/> Insurance</label>
                                </div>
                            </div>
                            <FormField label="Document Attachment" name="attachment">
                                <div className="flex items-center gap-2">
                                     <div className="relative">
                                        <input 
                                            type="file" 
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <button type="button" className={`px-4 py-2 bg-primary-lighter text-primary-main rounded-md text-sm font-medium hover:bg-primary-light flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                                             {isUploading ? <RefreshIcon className="w-4 h-4 animate-rotate"/> : <DocumentTextIcon className="w-4 h-4"/>}
                                             {isUploading ? 'Uploading...' : 'Choose File'}
                                        </button>
                                     </div>
                                </div>
                                {formData.uploadedDocuments.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {formData.uploadedDocuments.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                                <div className="flex items-center gap-2 truncate">
                                                     <DocumentTextIcon className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                                                     <a href={doc.url} target="_blank" rel="noreferrer" className="truncate hover:underline text-primary-main">{doc.fileName}</a>
                                                </div>
                                                <button type="button" onClick={() => removeDocument(index)} className="text-muted-foreground hover:text-error-main p-1">
                                                    <XCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Remarks" name="remarks">
                                    <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={3} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"></textarea>
                                </FormField>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                <div className="lg:col-span-1">
                    <div className="lg:sticky top-6">
                        <SectionCard icon={CurrencyDollarIcon} title="Payment Summary">
                            {isCalculatingRate ? (
                                <div className="flex flex-col items-center justify-center h-48">
                                    <RefreshIcon className="w-8 h-8 text-primary-main animate-rotate" />
                                    <p className="mt-2 text-muted-foreground">Calculating Rates...</p>
                                </div>
                            ) : rateDetails ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Chargeable Weight</span>
                                        <span className="font-medium">{(rateDetails.weightCalculation.finalWeight / 1000).toFixed(2)} kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Base Rate</span>
                                        <span>₹{rateDetails.baseRate.toFixed(2)}</span>
                                    </div>
                                    {rateDetails.charges.map((charge, index) => (
                                        <div key={index} className="flex justify-between">
                                            <span className="text-muted-foreground">{charge.chargeName}</span>
                                            <span>₹{charge.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-border">
                                        <span className="text-foreground">Total Amount</span>
                                        <span className="text-primary-main">₹{rateDetails.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-10 h-48 flex items-center justify-center">
                                    <p>Please fill sender, receiver, and shipment details to see the price.</p>
                                </div>
                            )}

                            <div className="mt-6">
                                <button 
                                    type="submit" 
                                    disabled={isCreatingOrder}
                                    className="w-full px-6 py-3 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                                    {isCreatingOrder ? 'Creating Order...' : 'Create Order'}
                                </button>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default CreateOrderPage;
