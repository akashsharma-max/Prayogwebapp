
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M3 4h18v2H3V4Zm0 7h18v2H3v-2Zm0 7h18v2H3v-2Z"></path></svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <nav className="flex items-center text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary-main">
                        Home
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    const name = value.split('-').map(capitalize).join(' ');

                    return (
                        <li key={to}>
                            <div className="flex items-center">
                                <ChevronRightIcon className="text-gray-400" />
                                <Link
                                    to={to}
                                    className={`ml-1 md:ml-2 font-medium ${isLast ? 'text-gray-800' : 'text-gray-500 hover:text-primary-main'}`}
                                >
                                    {name}
                                </Link>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

interface HeaderProps {
    onToggleMobileSidebar: () => void;
    onToggleDesktopSidebar: () => void;
    isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar, onToggleDesktopSidebar, isSidebarCollapsed }) => {
    const { logout } = useAuth();
    return (
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200">
            <div className="flex items-center">
                <button onClick={onToggleMobileSidebar} className="text-gray-500 focus:outline-none lg:hidden">
                   <MenuIcon className="w-6 h-6" />
                </button>
                <button onClick={onToggleDesktopSidebar} className="text-gray-500 focus:outline-none hidden lg:block mr-4">
                   <MenuIcon className="w-6 h-6" />
                </button>
                <div className="hidden lg:block">
                  <Breadcrumbs />
                </div>
            </div>
            <div className="flex items-center">
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-main rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;