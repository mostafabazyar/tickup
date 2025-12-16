import React, { useState, useEffect } from 'react';
import { User, KeyResult, Objective, StyleSettings } from '../types';
import { AIPrompts } from '../services/geminiService';
import Modal from './Modal';
import NewKeyResultForm from './NewKeyResultForm';
import { ArrowRightIcon } from './Icons';


interface AddKeyResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    objectives: Objective[];
    users: User[];
    onAddKeyResult: (krData: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'> & { objectiveId?: string }) => void;
    aiPrompts: AIPrompts;
    styleSettings: StyleSettings;
}

const AddKeyResultModal: React.FC<AddKeyResultModalProps> = ({ isOpen, onClose, objectives, users, onAddKeyResult, aiPrompts, styleSettings }) => {
    const [step, setStep] = useState(1);
    const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedObjective(null);
        }
    }, [isOpen]);
    
    const handleObjectiveSelect = (objective: Objective) => {
        setSelectedObjective(objective);
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
        setSelectedObjective(null);
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "ایجاد نتیجه کلیدی: انتخاب هدف" : `افزودن نتیجه کلیدی به: ${selectedObjective?.title}`}>
            {step === 1 && (
                <div className="space-y-2 animate-fade-in">
                    <h3 className="font-semibold mb-2">ابتدا هدفی که می‌خواهید نتیجه کلیدی را به آن اضافه کنید، انتخاب نمایید.</h3>
                    <div className="max-h-96 overflow-y-auto">
                        {objectives.map(o => (
                            <button key={o.id} onClick={() => handleObjectiveSelect(o)} className="w-full text-right p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                                {o.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && selectedObjective && (
                <div className="animate-fade-in">
                    <button onClick={handleBack} className="flex items-center text-sm font-semibold text-brand-primary mb-4">
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                        بازگشت به انتخاب هدف
                    </button>
                    <NewKeyResultForm
                        objective={selectedObjective}
                        onSubmit={onAddKeyResult}
                        onCancel={onClose}
                        users={users}
                        aiPrompts={aiPrompts}
                        styleSettings={styleSettings}
                    />
                </div>
            )}
        </Modal>
    );
};

export default AddKeyResultModal;
