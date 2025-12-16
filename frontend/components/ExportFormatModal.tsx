import React from 'react';
import Modal from './Modal';

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
}

const ExportFormatModal: React.FC<ExportFormatModalProps> = ({ isOpen, onClose, onExportPNG, onExportPDF }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="انتخاب فرمت خروجی">
      <div className="p-6 text-center">
        <p className="text-brand-subtext mb-6">می‌خواهید خروجی برنامه سالانه را با چه فرمتی دریافت کنید؟</p>
        <div className="flex justify-center space-x-4 space-x-reverse">
          <button
            onClick={onExportPNG}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            تصویر (PNG)
          </button>
          <button
            onClick={onExportPDF}
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportFormatModal;