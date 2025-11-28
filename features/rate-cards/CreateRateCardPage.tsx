
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusCircleIcon, MinusCircleIcon, CheckCircleIcon, CheckCircleFilledIcon, XCircleIcon } from '../../components/icons';
import { useToast } from '../../App';
import { ApiError } from '../../lib/apiClient';

// --- Types ---

interface GeneralDetails {
    name: string;
    serviceTypes: string[];
    description: string; // Conditions/Seasonal discounts
}

interface RateSlab {
    id: number;
    minWeight: string;
    maxWeight: string;
    zone: string;
    rate: string;
}

interface AdditionalCharge {
    id: number;
    name: string;
    chargeType: 'FIXED' | 'PERCENTAGE';
    value: string;
    isTaxable: boolean;
}

const STEPS = [
    { id: 0, title: 'General Details', description: 'Name, Service & Conditions' },
    { id: 1, title: 'Rate Slabs', description: 'Zone & Weight based rates' },
    { id: 2, title: 'Add-on Charges', description: 'Taxes & Extra fees' }
];

const CreateRateCardPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // --- State ---
    const [general, setGeneral] = useState<GeneralDetails>({
        name: '',
        serviceTypes: [],
        description: ''
    });
    const [serviceInput, setServiceInput] = useState('');

    const [rateSlabs, setRateSlabs] = useState<RateSlab[]>([
        { id: Date.now(), minWeight: '0', maxWeight: '0.5', zone: 'Zone A', rate: '' }
    ]);

    const [charges, setCharges] = useState<AdditionalCharge[]>([
        { id: Date.now(), name: 'Fuel Surcharge', chargeType: 'PERCENTAGE', value: '10', isTaxable: true }
    ]);

    // --- Handlers ---

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setGeneral(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addServiceType();
        }
    };

    const addServiceType = () => {
        const trimmed = serviceInput.trim();
        if (trimmed) {
            if (!general.serviceTypes.includes(trimmed)) {
                setGeneral(prev => ({ ...prev, serviceTypes: [...prev.serviceTypes, trimmed] }));
                setServiceInput('');
            } else {
                addToast('Service type already added', 'error');
            }
        }
    };

    const removeServiceType = (typeToRemove: string) => {
        setGeneral(prev => ({ ...prev, serviceTypes: prev.serviceTypes.filter(t => t !== typeToRemove) }));
    };

    // Rate Slab Handlers
    const addRateSlab = () => {
        setRateSlabs(prev => [...prev, { id: Date.now(), minWeight: '', maxWeight: '', zone: '', rate: '' }]);
    };

    const removeRateSlab = (index: number) => {
        setRateSlabs(prev => prev.filter((_, i) => i !== index));
    };

    const updateRateSlab = (index: number, field: keyof RateSlab, value: string) => {
        const newSlabs = [...rateSlabs];
        newSlabs[index] = { ...newSlabs[index], [field]: value };
        setRateSlabs(newSlabs);
    };

    // Charge Handlers
    const addCharge = () => {
        setCharges(prev => [...prev, { id: Date.now(), name: '', chargeType: 'FIXED', value: '', isTaxable: false }]);
    };

    const removeCharge = (index: number) => {
        setCharges(prev => prev.filter((_, i) => i !== index));
    };

    const updateCharge = (index: number, field: keyof AdditionalCharge, value: any) => {
        const newCharges = [...charges];
        newCharges[index] = { ...newCharges[index], [field]: value };
        setCharges(newCharges);
    };

    // Navigation & Validation
    const validateStep = (step: number): boolean => {
        if (step === 0) {
            if (!general.name.trim()) { addToast('Rate Card Name is required', 'error'); return false; }
            if (general.serviceTypes.length === 0) { addToast('At least one Service Type is required', 'error'); return false; }
        }
        if (step === 1) {
            if (rateSlabs.length === 0) { addToast('At least one rate slab is required', 'error'); return false; }
            for (let i = 0; i < rateSlabs.length; i++) {
                const s = rateSlabs[i];
                if (!s.minWeight || !s.maxWeight || !s.rate || !s.zone) {
                    addToast(`Please fill all fields in Row ${i + 1}`, 'error');
                    return false;
                }
                if (parseFloat(s.minWeight) >= parseFloat(s.maxWeight)) {
                    addToast(`Row ${i + 1}: Min Weight must be less than Max Weight`, 'error');
                    return false;
                }
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload = {
                ...general,
                slabs: rateSlabs.map(s => ({
                    ...s,
                    minWeight: parseFloat(s.minWeight),
                    maxWeight: parseFloat(s.maxWeight),
                    rate: parseFloat(s.rate)
                })),
                additionalCharges: charges.map(c => ({
                    ...c,
                    value: parseFloat(c.value)
                }))
            };

            console.log("Submitting Rate Card:", payload);
            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            addToast('Rate Card created successfully!', 'success');
            navigate('/finance/rate-cards');
        } catch (error) {
            const msg = error instanceof ApiError ? error.message : "Failed to submit rate card";
            addToast(msg, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Rate Card Name *</label>
                    <input type="text" name="name" value={general.name} onChange={handleGeneralChange} className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main" placeholder="e.g. Standard Local Rates 2025" />
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Service Types *</label>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            value={serviceInput} 
                            onChange={(e) => setServiceInput(e.target.value)} 
                            onKeyDown={handleServiceInputKeyDown}
                            className="flex-1 p-2 border border-border rounded-md bg-input focus:ring-primary-main" 
                            placeholder="Type service name and press Enter (e.g. Standard, Express)" 
                        />
                        <button 
                            type="button" 
                            onClick={addServiceType}
                            className="px-4 py-2 bg-primary-lighter text-primary-main rounded-md font-medium hover:bg-primary-light"
                        >
                            Add
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 border border-dashed border-border rounded-md bg-muted/30">
                        {general.serviceTypes.length === 0 && <span className="text-sm text-muted-foreground italic flex items-center h-full">No service types added yet.</span>}
                        {general.serviceTypes.map(type => (
                            <div key={type} className="flex items-center gap-1 bg-white dark:bg-card border border-border px-3 py-1.5 rounded-full text-sm shadow-sm animate-fade-in-up">
                                <span>{type}</span>
                                <button type="button" onClick={() => removeServiceType(type)} className="text-muted-foreground hover:text-error-main ml-1 transition-colors">
                                    <XCircleIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description / Conditions</label>
                    <textarea 
                        name="description" 
                        value={general.description} 
                        onChange={handleGeneralChange} 
                        rows={4} 
                        className="w-full p-2 border border-border rounded-md bg-input focus:ring-primary-main"
                        placeholder="Enter details about seasonal discounts, specific terms, or zone definitions..." 
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in-right">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-foreground">Weight Slabs & Rates</h3>
                <button type="button" onClick={addRateSlab} className="flex items-center text-sm text-primary-main font-medium hover:text-primary-dark">
                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Slab
                </button>
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Min Weight (kg)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Max Weight (kg)</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Zone</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Rate (₹)</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {rateSlabs.map((slab, index) => (
                            <tr key={slab.id}>
                                <td className="px-4 py-2">
                                    <input type="number" step="0.1" value={slab.minWeight} onChange={e => updateRateSlab(index, 'minWeight', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="0" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" step="0.1" value={slab.maxWeight} onChange={e => updateRateSlab(index, 'maxWeight', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="0.5" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="text" value={slab.zone} onChange={e => updateRateSlab(index, 'zone', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="e.g. Zone A" />
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={slab.rate} onChange={e => updateRateSlab(index, 'rate', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="0.00" />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {rateSlabs.length > 1 && (
                                        <button onClick={() => removeRateSlab(index)} className="text-error-main hover:text-error-dark">
                                            <MinusCircleIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {rateSlabs.length === 0 && <div className="text-center text-muted-foreground py-4">No rates added. Click "Add Slab" to begin.</div>}
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in-right">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-foreground">Additional Charges</h3>
                <button type="button" onClick={addCharge} className="flex items-center text-sm text-primary-main font-medium hover:text-primary-dark">
                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Charge
                </button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Charge Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase">Value</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-muted-foreground uppercase">Taxable</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {charges.map((charge, index) => (
                            <tr key={charge.id}>
                                <td className="px-4 py-2">
                                    <input type="text" value={charge.name} onChange={e => updateCharge(index, 'name', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="e.g. Fuel Surcharge" />
                                </td>
                                <td className="px-4 py-2">
                                    <select value={charge.chargeType} onChange={e => updateCharge(index, 'chargeType', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main">
                                        <option value="FIXED">Fixed Amount (₹)</option>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <input type="number" value={charge.value} onChange={e => updateCharge(index, 'value', e.target.value)} className="w-full p-1.5 border border-border rounded bg-input focus:ring-primary-main" placeholder="0" />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input type="checkbox" checked={charge.isTaxable} onChange={e => updateCharge(index, 'isTaxable', e.target.checked)} className="rounded border-border text-primary-main focus:ring-primary-main w-4 h-4" />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button onClick={() => removeCharge(index)} className="text-error-main hover:text-error-dark">
                                        <MinusCircleIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {charges.length === 0 && <div className="text-center text-muted-foreground py-4">No additional charges configured.</div>}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/finance/rate-cards')} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Cancel & Exit
                </button>
            </div>

            <div className="bg-card rounded-lg shadow-custom-light border border-border p-6 max-w-4xl mx-auto">
                {/* Stepper */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                         <div className="absolute left-0 top-5 w-full h-0.5 bg-border -z-0"></div>
                        {STEPS.map((step, index) => {
                            const isCompleted = currentStep > index;
                            const isCurrent = currentStep === index;
                            return (
                                <div key={step.id} className="flex flex-col items-center relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-card ${
                                        isCompleted ? 'border-primary-main text-primary-main' : 
                                        isCurrent ? 'border-primary-main text-primary-main shadow-lg ring-2 ring-primary-lighter' : 'border-muted-foreground text-muted-foreground'
                                    }`}>
                                        {isCompleted ? <CheckCircleFilledIcon className="w-10 h-10" /> : <span className="font-bold">{index + 1}</span>}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={`text-sm font-semibold ${isCurrent ? 'text-primary-main' : 'text-foreground'}`}>{step.title}</p>
                                        <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="min-h-[400px]">
                    {currentStep === 0 && renderStep1()}
                    {currentStep === 1 && renderStep2()}
                    {currentStep === 2 && renderStep3()}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t border-border">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0 || isLoading}
                        className="px-6 py-2 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Back
                    </button>
                    
                    {currentStep < 2 ? (
                         <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark"
                        >
                            Next Step
                        </button>
                    ) : (
                         <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-2 bg-success-main text-white rounded-lg hover:bg-success-dark flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating...' : 'Create Rate Card'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRateCardPage;
