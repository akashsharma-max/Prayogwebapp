import React from 'react';
import { KycDetails, KycStatus } from '../../../types';

const statusConfig: Record<KycStatus, { text: string; bg: string; }> = {
    'Completed': { text: 'text-success-darker dark:text-success-light', bg: 'bg-success-lighter dark:bg-success-darker' },
    'Pending': { text: 'text-warning-darker dark:text-warning-light', bg: 'bg-warning-lighter dark:bg-warning-darker' },
    'Not Started': { text: 'text-warning-darker dark:text-warning-light', bg: 'bg-warning-lighter dark:bg-warning-darker' },
    'Rejected': { text: 'text-error-darker dark:text-error-light', bg: 'bg-error-lighter dark:bg-error-darker' },
};

interface KycVerificationCardProps {
    kycDetails: KycDetails;
}

const KycVerificationCard: React.FC<KycVerificationCardProps> = ({ kycDetails }) => {
    const { status, documentType, documentNumber } = kycDetails;
    const config = statusConfig[status];

    return (
        <div className="relative p-6 bg-card rounded-lg shadow-sm overflow-hidden h-full flex flex-col border border-border">
            <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-foreground">KYC Verification</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                        {status}
                    </span>
                </div>
                {status !== 'Not Started' && documentType && (
                     <p className="text-sm text-muted-foreground mt-2">
                        {documentType}: {documentNumber}
                    </p>
                )}
                <div className="flex-grow"></div>
                {status !== 'Completed' && (
                    <button className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none transition-colors">
                        {status === 'Not Started' ? 'Start Verification' : 'Complete Verification'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default KycVerificationCard;