import React, { useState, useRef, useEffect } from 'react';
import { useFontSize } from '../context/FontSizeContext';
import { FontSizeIcon } from './icons';
import { FontSize } from '../types';

const FontSizeAdjuster: React.FC = () => {
    const { fontSize, setFontSize } = useFontSize();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSetFontSize = (size: FontSize) => {
        setFontSize(size);
        setIsOpen(false);
    };

    const options: { key: FontSize, label: string }[] = [
        { key: 'sm', label: 'Small' },
        { key: 'md', label: 'Medium' },
        { key: 'lg', label: 'Large' },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Adjust font size"
            >
                <FontSizeIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-card rounded-md shadow-lg z-10 border border-border">
                    <ul className="py-1 text-sm text-card-foreground">
                        {options.map(option => (
                             <li key={option.key}>
                                <button 
                                    onClick={() => handleSetFontSize(option.key)}
                                    className={`w-full text-left px-4 py-2 hover:bg-muted ${fontSize === option.key ? 'font-bold text-primary-main' : ''}`}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FontSizeAdjuster;