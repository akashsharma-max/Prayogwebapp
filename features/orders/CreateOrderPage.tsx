

import React, { useState, useMemo, ReactNode } from 'react';
import { TruckIcon, BoxIcon, DocumentTextIcon, CurrencyDollarIcon, PlusCircleIcon, MinusCircleIcon } from '../../components/icons';

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
interface FormState {
    senderName: string; senderPhone: string; senderAddress: string; senderPincode: string; senderGst: string; senderEmail: string;
    receiverName: string; receiverPhone: string; receiverAddress: string; receiverPincode: string; receiverEmail: string;
    products: Product[];
    shipments: Shipment[];
    documentNumber: string; serviceType: string; cod: boolean; insurance: boolean;
    ewayBill: string; remarks: string;
}
type FormErrors = { [K in keyof FormState]?: string | any };

const initialProduct: Product = { id: Date.now(), type: '', name: '', value: '', quantity: '1' };
const initialShipment: Shipment = { id: Date.now(), weight: '', length: '', breadth: '', height: '' };

const CreateOrderPage: React.FC = () => {
    const [formData, setFormData] = useState<FormState>({
        senderName: '', senderPhone: '', senderAddress: '', senderPincode: '', senderGst: '', senderEmail: '',
        receiverName: '', receiverPhone: '', receiverAddress: '', receiverPincode: '', receiverEmail: '',
        products: [initialProduct],
        shipments: [initialShipment],
        documentNumber: '', serviceType: 'Standard', cod: false, insurance: false,
        ewayBill: '', remarks: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    
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

    const calculateVolumetricWeight = (shipment: Shipment) => {
        const { length, breadth, height } = shipment;
        if (length && breadth && height) {
            return ((parseFloat(length) * parseFloat(breadth) * parseFloat(height)) / 5000).toFixed(2);
        }
        return '0.00';
    };

    const isFormValid = useMemo(() => {
        const newErrors: FormErrors = {};
        if (!formData.senderName) newErrors.senderName = 'Sender name is required.';
        if (!formData.senderPhone) newErrors.senderPhone = 'Sender phone is required.';
        if (!formData.senderAddress) newErrors.senderAddress = 'Sender address is required.';
        if (!formData.senderPincode) newErrors.senderPincode = 'Sender pincode is required.';

        if (!formData.receiverName) newErrors.receiverName = 'Receiver name is required.';
        if (!formData.receiverPhone) newErrors.receiverPhone = 'Receiver phone is required.';
        if (!formData.receiverAddress) newErrors.receiverAddress = 'Receiver address is required.';
        if (!formData.receiverPincode) newErrors.receiverPincode = 'Receiver pincode is required.';
        
        const productErrors = formData.products.map(p => {
            const err: Partial<Product> = {};
            if (!p.name) err.name = 'Required';
            if (!p.value) err.value = 'Required';
            if (!p.quantity) err.quantity = 'Required';
            return err;
        });

        if (productErrors.some(e => Object.keys(e).length > 0)) {
            newErrors.products = productErrors;
        }
        
        const shipmentErrors = formData.shipments.map(s => {
            const err: Partial<Shipment> = {};
            if (!s.weight) err.weight = 'Required';
            if (!s.length) err.length = 'Required';
            if (!s.breadth) err.breadth = 'Required';
            if (!s.height) err.height = 'Required';
            return err;
        });

        if (shipmentErrors.some(e => Object.keys(e).length > 0)) {
            newErrors.shipments = shipmentErrors;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            console.log('Form Submitted:', formData);
            alert('Order created successfully! (See console for data)');
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <SectionCard icon={TruckIcon} title="Sender & Receiver Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground border-b border-border pb-2">Sender Details</h3>
                                <FormField label="Name" name="senderName" required error={errors.senderName}>
                                    <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Phone Number" name="senderPhone" required error={errors.senderPhone}>
                                    <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Address" name="senderAddress" required error={errors.senderAddress}>
                                    <textarea name="senderAddress" value={formData.senderAddress} onChange={handleInputChange} rows={3} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"></textarea>
                                </FormField>
                                <FormField label="Pincode" name="senderPincode" required error={errors.senderPincode}>
                                    <input type="text" name="senderPincode" value={formData.senderPincode} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="GST Number" name="senderGst">
                                    <input type="text" name="senderGst" value={formData.senderGst} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Email" name="senderEmail">
                                    <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold text-foreground border-b border-border pb-2">Receiver Details</h3>
                                <FormField label="Name" name="receiverName" required error={errors.receiverName}>
                                    <input type="text" name="receiverName" value={formData.receiverName} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Phone Number" name="receiverPhone" required error={errors.receiverPhone}>
                                    <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Address" name="receiverAddress" required error={errors.receiverAddress}>
                                    <textarea name="receiverAddress" value={formData.receiverAddress} onChange={handleInputChange} rows={3} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"></textarea>
                                </FormField>
                                <FormField label="Pincode" name="receiverPincode" required error={errors.receiverPincode}>
                                    <input type="text" name="receiverPincode" value={formData.receiverPincode} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                                <FormField label="Email" name="receiverEmail">
                                    <input type="email" name="receiverEmail" value={formData.receiverEmail} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                </FormField>
                            </div>
                        </div>
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
                                    <FormField label="Product Name" name={`pname-${index}`} error={errors.products?.[index]?.name}>
                                        <input type="text" value={product.name} onChange={e => handleProductChange(index, 'name', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-2">
                                    <FormField label="Value (₹)" name={`pvalue-${index}`} error={errors.products?.[index]?.value}>
                                        <input type="number" value={product.value} onChange={e => handleProductChange(index, 'value', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <div className="col-span-12 sm:col-span-2">
                                    <FormField label="Quantity" name={`pqty-${index}`} error={errors.products?.[index]?.quantity}>
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
                                    <FormField label="Physical Weight (kg)" name={`sweight-${index}`} error={errors.shipments?.[index]?.weight}>
                                        <input type="number" value={shipment.weight} onChange={e => handleShipmentChange(index, 'weight', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Length (cm)" name={`slen-${index}`} error={errors.shipments?.[index]?.length}>
                                        <input type="number" value={shipment.length} onChange={e => handleShipmentChange(index, 'length', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Breadth (cm)" name={`sbreadth-${index}`} error={errors.shipments?.[index]?.breadth}>
                                        <input type="number" value={shipment.breadth} onChange={e => handleShipmentChange(index, 'breadth', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                    <FormField label="Height (cm)" name={`sheight-${index}`} error={errors.shipments?.[index]?.height}>
                                        <input type="number" value={shipment.height} onChange={e => handleShipmentChange(index, 'height', e.target.value)} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                                    </FormField>
                                </div>
                                <p className="text-sm mt-2 text-muted-foreground">Volumetric Weight: <span className="font-bold text-foreground">{calculateVolumetricWeight(shipment)} kg</span></p>
                            </div>
                        ))}
                        <button type="button" onClick={addShipment} className="mt-2 flex items-center gap-2 text-sm text-primary-main font-medium">
                            <PlusCircleIcon className="w-5 h-5" /> Add Child Shipment
                        </button>
                    </SectionCard>

                    <SectionCard icon={DocumentTextIcon} title="Other Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Service Type" name="serviceType">
                                <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main">
                                    <option>Standard</option>
                                    <option>Express</option>
                                    <option>Same Day</option>
                                </select>
                            </FormField>
                            <FormField label="E-way Bill Number" name="ewayBill">
                                <input type="text" name="ewayBill" value={formData.ewayBill} onChange={handleInputChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"/>
                            </FormField>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Additional Services</label>
                                <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2"><input type="checkbox" name="cod" checked={formData.cod} onChange={handleInputChange} className="rounded border-border"/> COD</label>
                                <label className="flex items-center gap-2"><input type="checkbox" name="insurance" checked={formData.insurance} onChange={handleInputChange} className="rounded border-border"/> Insurance</label>
                                </div>
                            </div>
                            <FormField label="Document Attachment" name="attachment">
                                <input type="file" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-lighter file:text-primary-main hover:file:bg-primary-main hover:file:text-white"/>
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
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Shipping Charges</span>
                                    <span>{isFormValid ? '₹ 50.00' : '₹ 0.00'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Volumetric Weight Charges</span>
                                    <span>{isFormValid ? '₹ 15.00' : '₹ 0.00'}</span>
                                </div>
                                {formData.cod && <div className="flex justify-between"><span className="text-muted-foreground">COD Charges</span><span>{isFormValid ? '₹ 20.00' : '₹ 0.00'}</span></div>}
                                {formData.insurance && <div className="flex justify-between"><span className="text-muted-foreground">Insurance Charges</span><span>{isFormValid ? '₹ 10.00' : '₹ 0.00'}</span></div>}
                                <div className="flex justify-between pt-2 border-t border-border">
                                    <span className="text-muted-foreground">GST (18%)</span>
                                    <span>{isFormValid ? '₹ 17.10' : '₹ 0.00'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-border">
                                    <span className="text-foreground">Total Amount</span>
                                    <span className="text-primary-main">{isFormValid ? '₹ 112.10' : '₹ 0.00'}</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="submit" disabled={!isFormValid} className="w-full px-6 py-3 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                                    Create Order
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