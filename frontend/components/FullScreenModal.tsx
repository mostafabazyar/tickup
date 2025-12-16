import React, { useRef } from 'react';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in"
      dir="rtl"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalContentRef}
        className="relative flex flex-col shadow-2xl bg-white dark:bg-slate-800 max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The child component (e.g., DocumentEditor) provides its own header and scrollable content */}
        {children}
      </div>
    </div>
  );
};

export default FullScreenModal;
