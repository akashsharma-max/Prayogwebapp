import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { mainNav } from '../../navigation';

const MainLayout: React.FC = () => {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar 
                navConfig={mainNav} 
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                isCollapsed={isDesktopSidebarCollapsed}
            />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
                <Header 
                    onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
                    onToggleDesktopSidebar={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
                    isSidebarCollapsed={isDesktopSidebarCollapsed}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="max-w-screen-2xl mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;