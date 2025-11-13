import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { mainNav } from '../../navigation';

const MainLayout: React.FC = () => {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    const mainContentMargin = isDesktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64';

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar 
                navConfig={mainNav} 
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                isCollapsed={isDesktopSidebarCollapsed}
            />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${mainContentMargin}`}>
                <Header 
                    onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                    onToggleDesktopSidebar={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                    isSidebarCollapsed={isDesktopSidebarCollapsed}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;