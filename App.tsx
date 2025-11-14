


import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import SettingsLayout from './components/layout/SettingsLayout';
import PlaceholderPage from './components/PlaceholderPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LoginPage from './features/auth/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { NavItem, ToastMessage, ToastType } from './types';
import { mainNav, settingsNav } from './navigation';
import RateCardsPage from './features/rate-cards/RateCardsPage';
import OrderHistoryPage from './features/orders/OrderHistoryPage';
import OrderDetailsPage from './features/orders/OrderDetailsPage';
import CreateOrderPage from './features/orders/CreateOrderPage';
import { XCircleIcon, CheckCircleIcon } from './components/icons';
import loadingSpinner from './lib/loadingSpinner';


// --- START GLOBAL SPINNER ---
const GlobalSpinner: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const listener = (loading: boolean) => {
            setIsLoading(loading);
        };

        loadingSpinner.subscribe(listener);

        return () => {
            loadingSpinner.unsubscribe(listener);
        };
    }, []);

    if (!isLoading) {
        return null;
    }
    
    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[200] overflow-hidden bg-primary-lighter">
            <div className="h-full bg-primary-main w-full origin-left-right animate-indeterminate-progress"></div>
        </div>
    );
};
// --- END GLOBAL SPINNER ---


// --- START TOAST NOTIFICATION SYSTEM ---
interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

let toastId = 0;

const Toast: React.FC<{ toast: ToastMessage; onClose: (id: number) => void; }> = ({ toast, onClose }) => {
  const { message, type } = toast;
  
  const config = {
      error: {
          bg: 'bg-error-lighter',
          text: 'text-error-darker',
          icon: <XCircleIcon className="w-6 h-6 text-error-main" />
      },
      success: {
          bg: 'bg-success-lighter',
          text: 'text-success-darker',
          icon: <CheckCircleIcon className="w-6 h-6 text-success-main" />
      }
  };

  const currentConfig = config[type];

  return (
      <div className={`flex items-start p-4 mb-4 rounded-lg shadow-lg ${currentConfig.bg} ${currentConfig.text} animate-fade-in-right`}>
          <div className="flex-shrink-0">
              {currentConfig.icon}
          </div>
          <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{message}</p>
          </div>
          <button onClick={() => onClose(toast.id)} className="ml-4 -mr-1 -mt-1 p-1 rounded-md focus:outline-none opacity-70 hover:opacity-100">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
      </div>
  );
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void; }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const newToast = { id: toastId++, message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 6000); // Auto-dismiss after 6 seconds
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
// --- END TOAST NOTIFICATION SYSTEM ---


const routeComponentMap: { [path: string]: React.ComponentType } = {
  '/dashboard': DashboardPage,
  '/finance/rate-cards': RateCardsPage,
  '/orders/view': OrderHistoryPage,
  '/orders/create': CreateOrderPage,
};


const generateRoutes = (navConfig: NavItem[]): React.ReactNode[] => {
  let routes: React.ReactNode[] = [];
  
  const recurse = (items: NavItem[]) => {
    for (const item of items) {
      if (item.path && !item.children) {
        const Component = routeComponentMap[item.path] || PlaceholderPage;
        routes.push(<Route key={item.path} path={item.path} element={<Component />} />);
      }
      if (item.children) {
        if (item.path) {
            routes.push(<Route key={item.path} path={item.path} element={<Navigate to={item.children[0].path!} replace />} />);
        }
        recurse(item.children);
      }
    }
  };

  recurse(navConfig);
  return routes;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
        <GlobalSpinner />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              {generateRoutes(mainNav)}
              <Route path="/orders/view/:orderId" element={<OrderDetailsPage />} />
            </Route>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/profile" replace />} />
              {generateRoutes(settingsNav)}
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </ToastProvider>
  );
};

export default App;