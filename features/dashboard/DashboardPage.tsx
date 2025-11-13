import React, { useState, useCallback } from 'react';
import WelcomeCard from './components/WelcomeCard';
import KycVerificationCard from './components/KycVerificationCard';
import WidgetSummaryCard from './components/WidgetSummaryCard';
import OrdersOverviewChart from './components/OrdersOverviewChart';
import TopSubTenantsTable from './components/TopSubTenantsTable';
import RecentUserOnboarding from './components/RecentUserOnboarding';

import { 
    kycData as initialKycData,
    widgetsData as initialWidgetsData,
    ordersOverviewData as initialOrdersData,
    topSubTenantsData as initialTenantsData,
    recentUsersData as initialUsersData,
} from '../../mocks/data';

const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState({
        widgets: false,
        orders: false,
        tenants: false,
        users: false,
    });

    const handleRefresh = useCallback((section: keyof typeof loading) => {
        setLoading(prev => ({ ...prev, [section]: true }));
        setTimeout(() => {
            setLoading(prev => ({ ...prev, [section]: false }));
        }, 1500); // Simulate network delay
    }, []);

    return (
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-8">
                <WelcomeCard userName="Admin" />
            </div>
            <div className="col-span-12 md:col-span-4">
                <KycVerificationCard kycDetails={initialKycData} />
            </div>

            {initialWidgetsData.map((widget, index) => (
                <div className="col-span-12 md:col-span-4" key={index}>
                    <WidgetSummaryCard 
                        widget={widget} 
                        isLoading={loading.widgets}
                        onRefresh={() => handleRefresh('widgets')}
                    />
                </div>
            ))}

            <div className="col-span-12">
                 <OrdersOverviewChart 
                    chartData={initialOrdersData}
                    isLoading={loading.orders}
                    onRefresh={() => handleRefresh('orders')}
                />
            </div>

            <div className="col-span-12 lg:col-span-8">
                <TopSubTenantsTable
                    tenants={initialTenantsData}
                    isLoading={loading.tenants}
                    onRefresh={() => handleRefresh('tenants')}
                />
            </div>
            
            <div className="col-span-12 lg:col-span-4">
                <RecentUserOnboarding
                    users={initialUsersData}
                    isLoading={loading.users}
                    onRefresh={() => handleRefresh('users')}
                />
            </div>
        </div>
    );
};

export default DashboardPage;