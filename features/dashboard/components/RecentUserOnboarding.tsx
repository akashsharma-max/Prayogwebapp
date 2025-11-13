import React from 'react';
import { RecentUser } from '../../../types';
import { RefreshIcon } from '../../../components/icons';

interface RecentUserOnboardingProps {
    users: RecentUser[];
    isLoading: boolean;
    onRefresh: () => void;
}

const RecentUserOnboarding: React.FC<RecentUserOnboardingProps> = ({ users, isLoading, onRefresh }) => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Recent User Onboarding</h3>
                <button onClick={onRefresh} className="text-gray-400 hover:text-gray-600">
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                </button>
            </div>
            <div className="mt-4 space-y-4 flex-grow overflow-y-auto">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.onboardedAt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentUserOnboarding;
