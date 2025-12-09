
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, RefreshIcon, CheckCircleFilledIcon, XCircleIcon } from '../../components/icons';
import apiClient, { ApiError } from '../../lib/apiClient';
import { useToast } from '../../App';
import { RateCardDetailed, RateCardStatus, RateCardMatrix, RateCardFilter, RateCardMatrixRow } from '../../types';

const StatusBadge: React.FC<{ status: RateCardStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1.5";
    let colorClasses = "";
    let Icon = CheckCircleFilledIcon;

    switch (status) {
        case RateCardStatus.Active:
            colorClasses = "bg-success-lighter text-success-darker dark:bg-success-darker dark:text-success-light";
            Icon = CheckCircleFilledIcon;
            break;
        case RateCardStatus.Inactive:
            colorClasses = "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200";
            Icon = XCircleIcon;
            break;
        case RateCardStatus.Draft:
            colorClasses = "bg-info-lighter text-info-darker dark:bg-info-darker dark:text-info-light";
            break;
    }
    return (
        <span className={`${baseClasses} ${colorClasses}`}>
            <Icon className="w-4 h-4" />
            {status}
        </span>
    );
};

// Helper to format camelCase locations to Title Case
const formatLocation = (loc: string) => {
    if (!loc) return '-';
    // Handle specific acronyms if needed, or just general camel case split
    if (loc === 'roi') return 'ROI';
    return loc.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
};

interface ProcessedSlab {
    min: number;
    max: number | null;
    unit: string;
    rates: Record<string, { rate: string; currency: string }>;
}

interface ProcessedFilterGroup {
    filterHash: string;
    filters: RateCardFilter[];
    locations: string[];
    slabs: ProcessedSlab[];
}

interface ProcessedMatrix {
    id: string;
    key: string;
    filterGroups: ProcessedFilterGroup[];
}

const RateCardDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [rateCard, setRateCard] = useState<RateCardDetailed | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const response = await apiClient.get(`/gateway/ure/api/rate-cards/unified/${id}`);

                if (response.status === 'success' && response.data) {
                    const data = response.data;
                    const detailed: RateCardDetailed = {
                        id: data.id,
                        name: data.name,
                        region: data.zoneGroupId ? 'Zone Based' : 'Global',
                        service: data.productType,
                        price: 'Variable',
                        status: data.isActive ? RateCardStatus.Active : RateCardStatus.Inactive,
                        matrices: data.matrices || [],
                        charges: data.charges || []
                    };
                    setRateCard(detailed);
                } else {
                    throw new Error(response.message || "Rate card not found");
                }
            } catch (error) {
                const msg = error instanceof ApiError ? error.message : "Failed to load rate card details";
                addToast(msg, 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [id, addToast]);

    // Pivot Data Logic
    const processedMatrices = useMemo<ProcessedMatrix[]>(() => {
        if (!rateCard) return [];

        return rateCard.matrices.map(matrix => {
            // 1. Group rows by unique filter combinations
            const groups: Record<string, RateCardMatrixRow[]> = {};
            
            matrix.rows.forEach(row => {
                // Sort filters to ensure consistent key generation regardless of API order
                const sortedFilters = [...row.filters].sort((a, b) => a.filterKey.localeCompare(b.filterKey));
                const filterKey = sortedFilters.length > 0 
                    ? sortedFilters.map(f => `${f.filterKey}:${f.filterValue}`).join('__') 
                    : 'default'; // For matrix with no filters
                
                if (!groups[filterKey]) {
                    groups[filterKey] = [];
                }
                groups[filterKey].push(row);
            });

            // 2. Process each filter group
            const filterGroups: ProcessedFilterGroup[] = Object.entries(groups).map(([filterHash, rows]) => {
                const filters = rows[0].filters;

                // Identify unique locations in this group to build columns
                const locations = Array.from(new Set(rows.map(r => r.location || 'Base'))).sort();
                
                // Custom sort for known locations if desired (Local -> State -> Zone -> Metro -> ROI -> Special)
                const locationOrder = ['local', 'withinState', 'zone', 'metro', 'roi', 'specialLocation'];
                locations.sort((a, b) => {
                    const idxA = locationOrder.indexOf(a);
                    const idxB = locationOrder.indexOf(b);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return a.localeCompare(b);
                });

                // Group by weight slab
                const slabMap: Record<string, ProcessedSlab> = {};

                rows.forEach(row => {
                    const weightDim = row.dimensions.find(d => d.dimensionKey.toLowerCase() === 'weight');
                    if (!weightDim) return; // Skip if no weight dimension (shouldn't happen for rate cards)
                    
                    const min = parseFloat(weightDim.minValue);
                    const max = weightDim.maxValue ? parseFloat(weightDim.maxValue) : null;
                    const unit = weightDim.unit;
                    const slabKey = `${min}-${max}-${unit}`;

                    if (!slabMap[slabKey]) {
                        slabMap[slabKey] = { min, max, unit, rates: {} };
                    }

                    const locKey = row.location || 'Base';
                    slabMap[slabKey].rates[locKey] = {
                        rate: row.rate,
                        currency: row.currency
                    };
                });

                // Convert map to array and sort by min weight
                const slabs = Object.values(slabMap).sort((a, b) => a.min - b.min);

                return {
                    filterHash,
                    filters,
                    locations,
                    slabs
                };
            });

            return {
                id: matrix.id,
                key: matrix.matrixKey,
                filterGroups
            };
        });
    }, [rateCard]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <RefreshIcon className="w-12 h-12 text-primary-main animate-rotate mb-4" />
                <p className="text-muted-foreground">Loading details...</p>
            </div>
        );
    }

    if (!rateCard) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-foreground mb-2">Rate Card Not Found</h2>
                <Link to="/finance/rate-cards" className="text-primary-main hover:underline">Back to List</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/finance/rate-cards" className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{rateCard.name}</h1>
                        <p className="text-muted-foreground text-sm flex items-center gap-2">
                            ID: {rateCard.id}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={rateCard.status} />
                </div>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Product Type</h3>
                    <p className="text-lg font-semibold text-foreground">{rateCard.service}</p>
                </div>
                <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Region / Zone Group</h3>
                    <p className="text-lg font-semibold text-foreground">{rateCard.region}</p>
                </div>
                 <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Matrices Count</h3>
                    <p className="text-lg font-semibold text-foreground">{rateCard.matrices.length}</p>
                </div>
            </div>

            {/* Matrices */}
            <div className="space-y-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-primary-main" />
                    Rate Matrices
                </h2>
                
                {processedMatrices.map((matrix) => (
                    <div key={matrix.id} className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground border-l-4 border-primary-main pl-3">{matrix.key} Matrix</h3>
                        
                        {matrix.filterGroups.map((group) => (
                            <div key={group.filterHash} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden mb-6">
                                {/* Filter Header */}
                                <div className="bg-muted/30 p-4 border-b border-border flex flex-wrap gap-2 items-center">
                                    <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>
                                    {group.filters.length > 0 ? (
                                        group.filters.map((f, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-white dark:bg-card border border-border rounded text-xs font-medium text-foreground shadow-sm">
                                                {f.filterKey}: <span className="text-primary-main">{f.filterValue}</span>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-foreground">Standard Rates (No Filters)</span>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                            <tr>
                                                <th className="px-6 py-3 whitespace-nowrap w-32 border-r border-border/50">Min Weight</th>
                                                <th className="px-6 py-3 whitespace-nowrap w-32 border-r border-border/50">Max Weight</th>
                                                {group.locations.map(loc => (
                                                    <th key={loc} className="px-6 py-3 whitespace-nowrap text-center">
                                                        {formatLocation(loc)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {group.slabs.map((slab, i) => (
                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-foreground border-r border-border/50">
                                                        {slab.min} {slab.unit}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-foreground border-r border-border/50">
                                                        {slab.max !== null ? `${slab.max} ${slab.unit}` : '∞'}
                                                    </td>
                                                    {group.locations.map(loc => {
                                                        const rateInfo = slab.rates[loc];
                                                        return (
                                                            <td key={loc} className="px-6 py-4 text-center">
                                                                {rateInfo ? (
                                                                    <span className="font-bold text-foreground">
                                                                        {rateInfo.currency} {rateInfo.rate}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground opacity-50">-</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Charges */}
            {rateCard.charges.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-border">
                    <h2 className="text-xl font-bold text-foreground">Additional Charges</h2>
                    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-3">Charge Name</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Value</th>
                                    <th className="px-6 py-3 text-center">Taxable</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rateCard.charges.map((charge) => (
                                    <tr key={charge.id} className="hover:bg-muted/30">
                                        <td className="px-6 py-4 font-medium text-foreground">{charge.chargeName}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs border border-border">
                                                {charge.chargeType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                if (charge.chargeType === 'FIXED') {
                                                    return `₹${charge.calculationConfig?.fixedAmount}`;
                                                } else if (charge.chargeType === 'PERCENTAGE') {
                                                    return `${charge.calculationConfig?.percentage}%`;
                                                } else if (charge.chargeType === 'SLAB' && charge.calculationConfig?.slabs) {
                                                     return (
                                                        <div className="flex flex-col gap-1">
                                                            {charge.calculationConfig.slabs.map((slab: any, idx: number) => (
                                                                <span key={idx} className="text-xs px-2 py-0.5 bg-muted rounded-sm inline-block">
                                                                    {slab.to !== null 
                                                                        ? `${slab.from} - ${slab.to}: ₹${slab.rate}` 
                                                                        : `> ${slab.from}: ₹${slab.rate}`
                                                                    }
                                                                </span>
                                                            ))}
                                                        </div>
                                                    );
                                                } else {
                                                     return <span className="text-muted-foreground italic">Complex/Formula</span>;
                                                }
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {charge.isTax ? (
                                                <div className="flex justify-center">
                                                    <CheckCircleFilledIcon className="w-5 h-5 text-success-main" />
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RateCardDetailsPage;
