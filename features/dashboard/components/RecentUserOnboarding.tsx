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
        <div className="p-6 bg-card rounded-lg shadow-sm h-full flex flex-col border border-border">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">Recent User Onboarding</h3>
                <button onClick={onRefresh} className="text-muted-foreground hover:text-foreground">
                    <RefreshIcon className={`w-5 h-5 ${isLoading ? 'animate-rotate' : ''}`} />
                </button>
            </div>
            <div className="mt-4 space-y-4 flex-grow overflow-y-auto">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.onboardedAt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentUserOnboarding;