import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { settingsNav } from '../../navigation';
import * as Icons from '../icons';
import { useAuth } from '../../context/AuthContext';
import ThemeToggleButton from '../ThemeToggleButton';

const SettingsLayout: React.FC = () => {
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
    const { logout } = useAuth();

    return (
        <div className="flex h-screen bg-background">
            <Sidebar 
                navConfig={settingsNav} 
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                isCollapsed={isDesktopSidebarCollapsed}
            />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300`}>
                <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-card border-b-2 border-border">
                    <div className="flex items-center">
                        <button onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)} className="text-muted-foreground focus:outline-none lg:hidden mr-4">
                            <Icons.MenuIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)} className="text-muted-foreground focus:outline-none hidden lg:block mr-4">
                           <Icons.MenuIcon className="w-6 h-6" />
                        </button>
                        <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Back to App
                        </Link>
                    </div>
                     <div className="flex items-center gap-4">
                        <ThemeToggleButton />
                        <button
                          onClick={logout}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="max-w-screen-2xl mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsLayout;