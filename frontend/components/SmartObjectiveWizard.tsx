// This is a new file: components/SmartObjectiveWizard.tsx
import React, { useState } from 'react';
import { Objective, KeyResult, User, StyleSettings, SuggestedPerspective, ObjectiveCategoryId, KRType, SuggestedKR, CompanyVision, KRCategory, SuggestedObjectiveWithKRs } from '../types';
import { generateSmartObjectives, AIPrompts } from '../services/geminiService';
import FullScreenModal from './FullScreenModal';
import { SparklesIcon, CheckCircleIcon } from './Icons';

interface SmartObjectiveWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (objectiveData: Omit<Objective, 'id' | 'keyResults'>, keyResults: Omit<KeyResult, 'id'>[]) => void;
  users: User[];
  defaultOwnerId: string;
  styleSettings: StyleSettings;
  aiPrompts: AIPrompts;
  companyVision: any; 
}

const BottomStepper: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center justify-center space-x-4 space-x-reverse mb-4">
        {[1, 2].map(step => (
            <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step}
                </div>
            </div>
        ))}
    </div>
);


const SmartObjectiveWizard: React.FC<SmartObjectiveWizardProps> = (props) => {
    const [step, setStep] = useState(1);
    
    // Step 1 State
    const [goalDescription, setGoalDescription] = useState('');
    const [motivation, setMotivation] = useState('');
    const [teamExpertise, setTeamExpertise] = useState('');
        
    // Step 2 State
    const [perspectives, setPerspectives] = useState<SuggestedPerspective[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [finalSelection, setFinalSelection] = useState<{
        objective: SuggestedObjectiveWithKRs;
        keyResults: Map<string, SuggestedKR>;
    } | null>(null);


    const handleClose = () => {
        // Reset all state
        setStep(1);
        setGoalDescription('');
        setMotivation('');
        setTeamExpertise('');
        setPerspectives([]);
        setIsLoading(false);
        setFinalSelection(null);
        props.onClose();
    };

    const fetchSuggestions = async (append = false) => {
        if (!append) {
            setIsLoading(true);
            setStep(2);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const results = await generateSmartObjectives({
                goalDescription,
                motivation,
                teamExpertise,
                companyVision: props.companyVision,
            }, props.aiPrompts.generateSmartObjectives);

            if (append) {
                setPerspectives(prev => [...prev, ...results]);
            } else {
                setPerspectives(results);
            }
        } catch (error) {
            console.error("Error generating smart objectives:", error);
            alert("خطا در دریافت پیشنهادات هوشمند. لطفا دوباره تلاش کنید.");
            if (!append) setStep(1); // Go back if initial fetch fails
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleSelectObjective = (perspectiveIndex: number, objectiveIndex: number) => {
        const objective = perspectives[perspectiveIndex].objectives[objectiveIndex];
        const initialKRs = new Map<string, SuggestedKR>();
        objective.keyResults.forEach(kr => initialKRs.set(kr.title, kr));
        
        setFinalSelection({
            objective: objective,
            keyResults: initialKRs,
        });
    };

    const handleToggleKR = (kr: SuggestedKR) => {
        if (!finalSelection) return;
        const newKRs = new Map(finalSelection.keyResults);
        if (newKRs.has(kr.title)) {
            newKRs.delete(kr.title);
        } else {
            newKRs.set(kr.title, kr);
        }
        setFinalSelection({ ...finalSelection, keyResults: newKRs });
    };

    const handleFinalSubmit = () => {
        if (!finalSelection) return;
        const objectiveData: Omit<Objective, 'id' | 'keyResults'> = {
            title: finalSelection.objective.objectiveTitle,
            description: finalSelection.objective.objectiveDescription,
            ownerId: props.defaultOwnerId,
            category: 'BUSINESS_GROWTH', // Default category for now
            isArchived: false,
        };
        const keyResultsData = Array.from(finalSelection.keyResults.values()).map((kr: SuggestedKR) => ({
            title: kr.title,
            type: kr.type,
            startValue: kr.startValue,
            targetValue: kr.targetValue,
            ownerId: props.defaultOwnerId,
            category: KRCategory.Standard,
        }));
        props.onSubmit(objectiveData, keyResultsData);
        handleClose();
    };


    const renderStep = () => {
        switch (step) {
            case 1: return (
                <div className="w-full max-w-2xl mx-auto text-center animate-fade-in p-4 sm:p-8">
                    <h2 className="text-3xl font-bold text-gray-800">ایده و انگیزه شما</h2>
                    <p className="text-gray-600 mt-2">با پاسخ به سوالات زیر، به هوش مصنوعی برای درک بهتر هدف خود کمک کنید.</p>
                    <div className="space-y-6 mt-8 text-right">
                        <div>
                            <label className="font-semibold">توضیحات و ایده‌های شما در مورد این هدف چیست؟</label>
                            <textarea value={goalDescription} onChange={e => setGoalDescription(e.target.value)} rows={4} className="input-style w-full mt-2" placeholder="مثال: افزایش سهم بازار در منطقه شمال کشور..."/>
                        </div>
                        <div>
                            <label className="font-semibold">چرا این هدف مد نظر شماست؟ چه انگیزه‌هایی پشت آن است؟</label>
                            <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={3} className="input-style w-full mt-2" placeholder="مثال: رسیدن به نقطه سر به سر، افزایش اعتبار برند..."/>
                        </div>
                         <div>
                            <label className="font-semibold">در مورد تیم و تخصص افراد بنویسید.</label>
                            <textarea value={teamExpertise} onChange={e => setTeamExpertise(e.target.value)} rows={3} className="input-style w-full mt-2" placeholder="مثال: تیم فروش ما تجربه بالایی در بازاریابی B2B دارد..."/>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button onClick={() => fetchSuggestions()} disabled={isLoading} className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:scale-105 disabled:bg-gray-400 flex items-center justify-center min-w-[200px]">
                            {isLoading ? 'در حال تحلیل...' : <><SparklesIcon className="w-5 h-5 ml-2" /> دریافت پیشنهادات</>}
                        </button>
                    </div>
                </div>
            );
             case 2: return (
                 <div className="w-full max-w-6xl mx-auto animate-fade-in p-4 sm:p-8">
                     <h2 className="text-3xl font-bold text-gray-800 text-center">پیشنهادات هوشمند</h2>
                     <p className="text-gray-600 mt-2 mb-8 text-center">بر اساس ورودی‌های شما، این زوایای دید و اهداف پیشنهاد می‌شوند. بهترین گزینه را انتخاب کنید.</p>
                     {isLoading ? <p className="text-center py-20">در حال دریافت پیشنهادات...</p> : (
                        <div className="space-y-6">
                            {perspectives.map((p, pIndex) => (
                                <div key={pIndex} className="bg-white border rounded-lg p-4">
                                    <h3 className="font-bold text-lg mb-1">{p.perspectiveTitle}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{p.perspectiveDescription}</p>
                                    <div className="space-y-4">
                                        {p.objectives.map((obj, oIndex) => {
                                            const isSelected = finalSelection?.objective === obj;
                                            return (
                                                <div key={oIndex} className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'bg-gray-50'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold">{obj.objectiveTitle}</h4>
                                                            <p className="text-xs text-gray-500">{obj.objectiveDescription}</p>
                                                        </div>
                                                        <button onClick={() => handleSelectObjective(pIndex, oIndex)} className={`px-3 py-1 text-sm font-semibold rounded-md ${isSelected ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                                                            {isSelected ? 'تغییر' : 'انتخاب'}
                                                        </button>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="mt-4 pt-3 border-t space-y-2">
                                                            <h5 className="text-sm font-semibold">نتایج کلیدی پیشنهادی (برای اضافه کردن انتخاب کنید):</h5>
                                                            {obj.keyResults.map(kr => (
                                                                <label key={kr.title} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                                                                    <input type="checkbox" checked={finalSelection.keyResults.has(kr.title)} onChange={() => handleToggleKR(kr)} className="w-4 h-4 ml-3"/>
                                                                    <span className="text-sm">{kr.title} ({kr.startValue} &rarr; {kr.targetValue})</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                     <div className="flex justify-between items-center mt-8">
                         <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">بازگشت</button>
                         {finalSelection ? (
                            <button onClick={handleFinalSubmit} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-700">ایجاد هدف نهایی</button>
                         ) : (
                             <button onClick={() => fetchSuggestions(true)} disabled={isLoadingMore} className="px-6 py-3 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center min-w-[180px]">
                                {isLoadingMore ? 'در حال دریافت...' : 'پیشنهادات بیشتر'}
                             </button>
                         )}
                    </div>
                 </div>
             );
            default: return null;
        }
    };

    return (
        <FullScreenModal isOpen={props.isOpen} onClose={handleClose}>
            <div className="p-4 sm:p-8 pt-16 h-full overflow-y-auto">
                {step < 3 && <BottomStepper currentStep={step} />}
                {renderStep()}
            </div>
        </FullScreenModal>
    );
};

export default SmartObjectiveWizard;
