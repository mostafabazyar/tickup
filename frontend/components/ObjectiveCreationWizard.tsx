import React, { useState } from 'react';
import { Objective, KeyResult, User, StyleSettings, ObjectiveCategoryId, KRCategory, KRType } from '../types';
import { AIPrompts } from '../services/geminiService';
import NewObjectiveForm from './NewObjectiveForm';
import NewKeyResultForm from './NewKeyResultForm';
import { CheckCircleIcon, TrophyIcon, TrashIcon } from './Icons';

const STEPS = [
    { number: 1, title: 'ایجاد هدف' },
    { number: 2, title: 'ایجاد نتایج کلیدی' },
    { number: 3, title: 'تایید نهایی' }
];

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    return (
        <div className="flex items-center justify-center px-4 py-3 sm:px-8 sm:py-4 border-b bg-white rounded-t-lg">
            {STEPS.map((stepInfo, index) => (
                <React.Fragment key={stepInfo.number}>
                    <div className="flex items-center text-center flex-col sm:flex-row">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= stepInfo.number ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {currentStep > stepInfo.number ? '✓' : stepInfo.number}
                        </div>
                        <p className={`mt-1 sm:mt-0 sm:mr-2 font-semibold text-xs sm:text-sm transition-colors duration-300 ${currentStep >= stepInfo.number ? 'text-brand-primary' : 'text-gray-500'}`}>
                            {stepInfo.title}
                        </p>
                    </div>
                    {index < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-2 sm:mx-4"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

interface KeyResultsStepProps {
  objective: Omit<Objective, 'id' | 'keyResults'>;
  keyResults: Omit<KeyResult, 'id'>[];
  onAddKeyResult: (kr: Omit<KeyResult, 'id'>) => void;
  onDeleteKeyResult: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  users: User[];
  aiPrompts: AIPrompts;
  styleSettings: StyleSettings;
}

const KeyResultsStep: React.FC<KeyResultsStepProps> = ({ objective, keyResults, onAddKeyResult, onDeleteKeyResult, onBack, onNext, users, aiPrompts, styleSettings }) => {
    const [formKey, setFormKey] = useState(0);

    const handleInternalAdd = (krData: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'>) => {
        onAddKeyResult(krData);
        setFormKey(k => k + 1); // Reset form by re-mounting
    };

    return (
        <div className="p-4 sm:p-8">
            <h2 className="text-xl font-bold mb-1">نتایج کلیدی برای: <span className="text-brand-primary">{objective.title}</span></h2>
            <p className="text-sm text-brand-subtext mb-6">یک یا چند نتیجه کلیدی قابل اندازه‌گیری برای این هدف تعریف کنید.</p>
            
            <div className="space-y-3 mb-6">
                {keyResults.map((kr, index) => (
                    <div key={index} className="flex items-center bg-gray-100/70 p-2 rounded-lg">
                        <span className="font-semibold text-sm flex-grow">{kr.title}</span>
                        <button onClick={() => onDeleteKeyResult(index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                ))}
                 {keyResults.length === 0 && <p className="text-center text-sm text-gray-400 py-4">هنوز نتیجه کلیدی اضافه نشده است.</p>}
            </div>

            <div className="border-t pt-6">
                <NewKeyResultForm
                    key={formKey}
                    objective={objective as Objective}
                    onSubmit={handleInternalAdd}
                    onCancel={() => setFormKey(k => k + 1)} // Also reset on cancel
                    users={users}
                    aiPrompts={aiPrompts}
                    styleSettings={styleSettings}
                />
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t">
                <button onClick={onBack} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm">مرحله قبل</button>
                <button onClick={onNext} disabled={keyResults.length === 0} className="px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold text-sm disabled:bg-gray-300">مرحله بعد</button>
            </div>
        </div>
    );
};

const ConfirmationStep: React.FC<{ onFinish: () => void }> = ({ onFinish }) => (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <TrophyIcon className="w-16 h-16 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-text">آفرین!</h2>
        <p className="text-brand-subtext mt-2 max-w-sm mx-auto">هدف شما با موفقیت ایجاد شد و آماده تلاش هدفمند هستی.</p>
        <button onClick={onFinish} className="mt-8 px-6 py-3 bg-brand-primary text-white rounded-lg font-semibold shadow-lg hover:bg-blue-700">پایان و مشاهده اهداف</button>
    </div>
);


interface ObjectiveCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (objectiveData: Omit<Objective, 'id' | 'keyResults'>, keyResults: Omit<KeyResult, 'id'>[]) => void;
  users: User[];
  objectives: Objective[];
  defaultOwnerId: string;
  styleSettings: StyleSettings;
  aiPrompts: AIPrompts;
}

const ObjectiveCreationWizard: React.FC<ObjectiveCreationWizardProps> = (props) => {
    const [step, setStep] = useState(1);
    const [objectiveData, setObjectiveData] = useState<Omit<Objective, 'id' | 'keyResults'> | null>(null);
    const [keyResults, setKeyResults] = useState<Omit<KeyResult, 'id'>[]>([]);
    
    const handleClose = () => {
        setStep(1);
        setObjectiveData(null);
        setKeyResults([]);
        props.onClose();
    };

    const handleObjectiveSubmit = (title: string, description: string, ownerId: string, category: ObjectiveCategoryId, parentId: string | undefined, color: string, endDate: string | undefined, quarter: string | undefined) => {
        setObjectiveData({ title, description, ownerId, category, parentId, isArchived: false, color, endDate, quarter });
        setStep(2);
    };
    
    const handleAddKeyResult = (krData: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'>) => {
        setKeyResults(prev => [...prev, krData]);
    };

    const handleDeleteKeyResult = (indexToDelete: number) => {
        setKeyResults(prev => prev.filter((_, index) => index !== indexToDelete));
    };
    
    const handleFinish = () => {
        if (!objectiveData) return;
        props.onSubmit(objectiveData, keyResults);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <NewObjectiveForm {...props} onSubmit={(title, description, ownerId, category, parentId, color, endDate, quarter) => handleObjectiveSubmit(title, description, ownerId, category, parentId, color, endDate, quarter)} onCancel={handleClose} />;
            case 2:
                return (
                    <KeyResultsStep
                        objective={objectiveData!}
                        keyResults={keyResults}
                        onAddKeyResult={handleAddKeyResult}
                        onDeleteKeyResult={handleDeleteKeyResult}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                        users={props.users}
                        aiPrompts={props.aiPrompts}
                        styleSettings={props.styleSettings}
                    />
                );
            case 3:
                return <ConfirmationStep onFinish={handleFinish} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-0 md:p-4 animate-fade-in">
             <div className="bg-brand-secondary rounded-none md:rounded-lg w-full h-full max-w-4xl max-h-full md:max-h-[90vh] flex flex-col">
                <Stepper currentStep={step} />
                <div className="flex-grow overflow-y-auto">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default ObjectiveCreationWizard;
