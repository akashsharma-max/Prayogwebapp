import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FontSize } from '../types';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const classMap: Record<FontSize, string> = {
    sm: 'font-size-sm',
    md: 'font-size-md',
    lg: 'font-size-lg',
};

export const FontSizeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('fontSize') as FontSize) || 'sm';
    }
    return 'sm';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old classes
    Object.values(classMap).forEach(cls => root.classList.remove(cls));
    
    // Add current class
    root.classList.add(classMap[fontSize] || classMap.sm);
    
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};