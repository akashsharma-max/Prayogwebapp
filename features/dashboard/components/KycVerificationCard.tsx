import React from 'react';
import { KycDetails, KycStatus } from '../../../types';

const statusConfig: Record<KycStatus, { text: string; bg: string; }> = {
    'Completed': { text: 'text-success-darker', bg: 'bg-success-lighter' },
    'Pending': { text: 'text-warning-darker', bg: 'bg-warning-lighter' },
    'Not Started': { text: 'text-warning-darker', bg: 'bg-warning-lighter' },
    'Rejected': { text: 'text-error-darker', bg: 'bg-error-lighter' },
};

interface KycVerificationCardProps {
    kycDetails: KycDetails;
}

const KycVerificationCard: React.FC<KycVerificationCardProps> = ({ kycDetails }) => {
    const { status, documentType, documentNumber } = kycDetails;
    const config = statusConfig[status];

    return (
        <div className="relative p-6 bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
            <img 
                src="https://www.tmf-group.com/-/media/images/backgrounds/insights/2022/tmf-insight-background-kyc-blue-1920x1080.jpg"
                alt="KYC Background"
                className="absolute top-0 left-0 w-full h-full object-cover opacity-10"
            />
            <div className="relative z-10 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">KYC Verification</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
                        {status}
                    </span>
                </div>
                {status !== 'Not Started' && documentType && (
                     <p className="text-sm text-gray-600 mt-2">
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
