import React, { useRef, useEffect } from 'react';
import { GoalIcon, TrophyIcon, SparklesIcon } from './Icons';

interface ObjectiveCreateMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorEl: HTMLElement | null;
    onSelectObjective: () => void;
    onSelectKeyResult: () => void;
    onSelectSmartObjective: () => void;
}

const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void, anchorRef?: React.RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node) || (anchorRef?.current && anchorRef.current.contains(event.target as Node))) {
                return;
            }
            handler();
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, anchorRef]);
};

const ObjectiveCreateMenu: React.FC<ObjectiveCreateMenuProps> = ({ isOpen, onClose, anchorEl, onSelectObjective, onSelectKeyResult, onSelectSmartObjective }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    useClickOutside(menuRef, onClose, { current: anchorEl });

    if (!isOpen || !anchorEl) return null;

    const rect = anchorEl.getBoundingClientRect();
    const style: React.CSSProperties = {
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 50,
        width: '240px',
    };

    return (
        <div ref={menuRef} style={style} className="bg-white rounded-lg shadow-xl border z-50 animate-fade-in py-2">
            <ul>
                <li>
                    <button onClick={() => { onSelectSmartObjective(); onClose(); }} className="w-full flex items-center px-4 py-2 text-right text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold">
                        <SparklesIcon className="w-5 h-5 ml-3" />
                        <span>طراحی هدف با هوش مصنوعی</span>
                    </button>
                </li>
                 <li className="my-1 border-t"></li>
                <li>
                    <button onClick={() => { onSelectObjective(); onClose(); }} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                        <GoalIcon className="w-5 h-5 ml-3 text-gray-500" />
                        <span>ایجاد هدف جدید</span>
                    </button>
                </li>
                <li>
                    <button onClick={() => { onSelectKeyResult(); onClose(); }} className="w-full flex items-center px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-100">
                        <TrophyIcon className="w-5 h-5 ml-3 text-gray-500" />
                        <span>ایجاد نتیجه کلیدی</span>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ObjectiveCreateMenu;