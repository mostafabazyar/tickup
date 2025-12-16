import React, { useState, useEffect, useRef } from 'react';
import { ThreeDotsIcon, EyeIcon, ArchiveBoxIcon, DocumentArrowUpIcon } from './Icons';

interface HeaderProps {
    pageTitle: string;
    onOpenArchivedModal?: () => void;
    onExportProgram?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, onOpenArchivedModal, onExportProgram }) => {
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const optionsMenuRef = useRef<HTMLDivElement>(null);
    const [dashboardActiveTab, setDashboardActiveTab] = useState('list');

    useEffect(() => {
        const handleTabChange = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail && customEvent.detail.activeTab) {
                setDashboardActiveTab(customEvent.detail.activeTab);
            }
        };
        window.addEventListener('dashboardTabChange', handleTabChange);
        return () => {
            window.removeEventListener('dashboardTabChange', handleTabChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          const target = event.target as Node;
          if (optionsMenuRef.current && !optionsMenuRef.current.contains(target)) {
              const button = (optionsMenuRef.current.previousSibling as HTMLElement);
              if (button && !button.contains(target)) {
                setIsOptionsMenuOpen(false);
              }
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderMenuItems = () => {
        return (
            <>
                <button onClick={() => { onOpenArchivedModal?.(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    <ArchiveBoxIcon className="w-4 h-4 ml-2 text-gray-500" />
                    آرشیو اهداف
                </button>
                {dashboardActiveTab === 'program' && (
                    <button onClick={() => { onExportProgram?.(); setIsOptionsMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        <DocumentArrowUpIcon className="w-4 h-4 ml-2 text-gray-500" />
                        گرفتن خروجی تصویر یا PDF
                    </button>
                )}
            </>
        );
    };

    return (
        <header className="flex-shrink-0 h-12 bg-white dark:bg-slate-800 z-20">
            <div className="px-4 h-full flex items-center justify-between">
                <div className="flex items-center min-w-0">
                     <h1 className="text-lg font-bold text-brand-text dark:text-slate-200 truncate ml-2">{pageTitle}</h1>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="relative">
                        <button onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">
                            <ThreeDotsIcon className="w-5 h-5" />
                        </button>
                        {isOptionsMenuOpen && (
                            <div ref={optionsMenuRef} className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-30 animate-fade-in" role="menu">
                                <div className="py-1" role="none">
                                    {renderMenuItems()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
