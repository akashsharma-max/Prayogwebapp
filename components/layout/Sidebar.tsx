import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { NavItem } from '../../types';
import * as Icons from '../icons';

interface SidebarProps {
  navConfig: NavItem[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ navConfig, isMobileOpen, onCloseMobile, isCollapsed }) => {
  const sidebarWidth = isCollapsed ? 'lg:w-20' : 'lg:w-64';
  
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-25 z-20 lg:hidden ${isMobileOpen ? 'block' : 'hidden'}`} onClick={onCloseMobile}></div>
      
      <aside className={`fixed top-0 left-0 h-full bg-gray-800 dark:bg-gray-900 text-white transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out z-30 flex flex-col ${sidebarWidth}`}>
        <div className="p-4 flex items-center justify-center border-b border-gray-700 dark:border-gray-700 h-16">
          <Link to="/" className={`text-2xl font-bold transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            SaaS
          </Link>
          <Link to="/settings" className="lg:hidden">
              <Icons.SettingsIcon className="w-6 h-6 text-gray-400 hover:text-white" />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {navConfig.map((item, index) => (
            <NavItemComponent key={index} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700 dark:border-gray-700 hidden lg:block">
            <Link to="/settings" className="flex items-center w-full p-2 text-gray-400 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-white">
                <Icons.SettingsIcon className="w-6 h-6 flex-shrink-0" />
                <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>Settings</span>
            </Link>
        </div>
      </aside>
    </>
  );
};


const NavItemComponent: React.FC<{ item: NavItem, isCollapsed: boolean }> = ({ item, isCollapsed }) => {
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(pathname.startsWith(item.path || '---'));

    if (item.isHeader) {
        return (
            <div className={`px-3 py-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 invisible' : 'opacity-100'}`}>
                <h3 className="text-xs font-bold uppercase text-gray-400 dark:text-gray-500">{item.title}</h3>
            </div>
        );
    }

    if (item.children) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-2 text-left text-gray-300 dark:text-gray-400 rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-white focus:outline-none"
                >
                    <div className="flex items-center">
                        {item.icon && <item.icon className="w-6 h-6 flex-shrink-0" />}
                        <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{item.title}</span>
                    </div>
                    {!isCollapsed && <Icons.ChevronDownIcon className={`w-4 h-4 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />}
                </button>
                {isOpen && !isCollapsed && (
                    <div className="pl-6 mt-1 space-y-1">
                        {item.children.map((child, index) => (
                            <NavItemComponent key={index} item={child} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <NavLink
            to={item.path!}
            className={({ isActive }) => 
                `flex items-center p-2 rounded-md text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-600 hover:text-white ${isActive ? 'bg-gray-900 dark:bg-primary-main text-white' : ''} ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? item.title : ''}
        >
            {item.icon && <item.icon className="w-6 h-6 flex-shrink-0" />}
            <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{item.title}</span>
        </NavLink>
    );
};

export default Sidebar;