import React, { useState } from 'react';
import { User, KRType, KRCategory, KeyResult, StretchLevel, SuggestedKR, Objective, StyleSettings } from '../types';
import { ArrowRightIcon, SparklesIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { suggestKeyResults } from '../services/geminiService';
import { AIPrompts } from '../services/geminiService';
import { UNIT_DEFINITIONS } from '../constants';
import DueDateSelector from './DueDateSelector';

interface NewKeyResultFormProps {
  users: User[];
  objective: Objective;
  onSubmit: (krData: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'> & { objectiveId?: string }) => void;
  onCancel: () => void;
  aiPrompts: AIPrompts;
  styleSettings: StyleSettings;
}

const KR_CATEGORY_OPTIONS = [
    { type: KRCategory.Standard, title: 'معمولی', description: 'پیشرفت با شروع و هدف عددی.' },
    { type: KRCategory.Stretch, title: 'کششی', description: 'تعریف سطوح مختلف برای دستیابی.' },
    { type: KRCategory.Binary, title: 'دو گزینه‌ای', description: 'مانند انجام شد / انجام نشد.' },
];

const NewKeyResultForm: React.FC<NewKeyResultFormProps> = ({ users, objective, onSubmit, onCancel, aiPrompts, styleSettings }) => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<KRCategory | null>(null);
  
  // Common fields
  const [title, setTitle] = useState('');
  const [ownerId, setOwnerId] = useState(users[0]?.id || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Standard fields
  const [krType, setKrType] = useState<KRType>(KRType.Number);
  const [startValue, setStartValue] = useState(0);
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('number');
  const [targetDirection, setTargetDirection] = useState<'INCREASING' | 'DECREASING'>('INCREASING');


  // Stretch fields
  const [stretchTarget, setStretchTarget] = useState(100);
  const [stretchLevels, setStretchLevels] = useState<StretchLevel[]>([
    { label: 'معمولی', value: 30 },
    { label: 'عالی', value: 60 },
    { label: 'فوق العاده', value: 100 },
  ]);

  // Binary fields
  const [binaryLabels, setBinaryLabels] = useState({ incomplete: 'انجام نشده', complete: 'انجام شد' });

  // AI Suggestions
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedKR[]>([]);
  
  const isModern2Style = styleSettings.primaryColor === '#F59E0B';

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const results = await suggestKeyResults(objective.title, objective.description, aiPrompts.suggestKeyResults);
      setSuggestions(results);
    } catch (e) {
      console.error(e);
      alert('خطا در دریافت پیشنهاد از هوش مصنوعی.');
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const applySuggestion = (suggestion: SuggestedKR) => {
    setTitle(suggestion.title);
    setKrType(suggestion.type);
    setStartValue(suggestion.startValue);
    setTargetValue(suggestion.targetValue);
    if (suggestion.type === KRType.Percentage) {
        setUnit('percentage');
    } else if (suggestion.type === KRType.Currency) {
        setUnit('toman');
    } else {
        setUnit('number');
    }
    setSuggestions([]); // Close suggestions dropdown
  };


  const handleCategorySelect = (cat: KRCategory) => {
    setCategory(cat);
    setStep(2);
  };

  const handleStretchLevelChange = (index: number, field: keyof StretchLevel, value: string | number) => {
    const newLevels = [...stretchLevels];
    (newLevels[index] as any)[field] = value;
    setStretchLevels(newLevels);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnitValue = e.target.value;
    setUnit(selectedUnitValue);

    for (const group of UNIT_DEFINITIONS) {
        const foundUnit = group.units.find(u => u.value === selectedUnitValue);
        if (foundUnit) {
            setKrType(foundUnit.type);
            break;
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) {
      alert('عنوان نتیجه کلیدی الزامی است.');
      return;
    }
    
    let krData: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'> = { 
        title, 
        ownerId, 
        category,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    };

    switch(category) {
        case KRCategory.Standard:
            const finalUnit = unit === 'number' || unit === 'percentage' ? undefined : unit;
            krData = { ...krData, type: krType, unit: finalUnit, startValue, targetValue, targetDirection };
            break;
        case KRCategory.Stretch:
            krData = { ...krData, startValue: 0, targetValue: stretchTarget, stretchLevels };
            break;
        case KRCategory.Binary:
            krData = { ...krData, binaryLabels };
            break;
    }

    onSubmit({ ...krData, objectiveId: objective.id });
  };
  
  if (step === 1) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-center mb-4">نوع نتیجه کلیدی را انتخاب کنید</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KR_CATEGORY_OPTIONS.map(opt => (
                    <button key={opt.type} onClick={() => handleCategorySelect(opt.type)} className="p-4 text-right border rounded-lg hover:bg-gray-100 hover:border-brand-primary">
                        <h4 className="font-semibold">{opt.title}</h4>
                        <p className="text-sm text-brand-subtext">{opt.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 text-right">
       <button type="button" onClick={() => setStep(1)} className="flex items-center text-sm font-semibold text-brand-primary mb-4">
           <ArrowRightIcon className="w-4 h-4 ml-1" />
           بازگشت به انتخاب نوع
       </button>
      <div className="relative">
        <label htmlFor="kr-title" className="block text-sm font-medium text-brand-text">عنوان نتیجه کلیدی</label>
        <div className="flex items-center space-x-2 space-x-reverse">
            <input type="text" id="kr-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full input-style" />
            <button
                type="button"
                onClick={handleSuggest}
                disabled={isSuggesting}
                className="mt-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex-shrink-0"
                title="دریافت پیشنهاد با هوش مصنوعی"
            >
                 <SparklesIcon className={`w-5 h-5 ${isSuggesting ? 'animate-pulse' : ''}`}/>
            </button>
        </div>
        {suggestions.length > 0 && (
            <div className="absolute top-full right-0 w-full bg-white border shadow-lg rounded-md mt-1 z-10 max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                    <button
                        type="button"
                        key={i}
                        onClick={() => applySuggestion(s)}
                        className="w-full text-right p-3 text-sm hover:bg-gray-100"
                    >
                        {s.title}
                    </button>
                ))}
            </div>
        )}
      </div>
      <div>
        <label htmlFor="kr-owner" className="block text-sm font-medium text-brand-text">مالک</label>
        <select id="kr-owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="mt-1 block w-full input-style">
          {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
      </div>

      <div>
            <label className="block text-sm font-medium text-brand-text">بازه زمانی (اختیاری)</label>
            <div className="flex space-x-4 space-x-reverse mt-1">
                <div className="w-1/2 p-2 border border-gray-300 rounded-md dark:border-slate-600 bg-white dark:bg-slate-700">
                    <DueDateSelector value={startDate} onChange={setStartDate} />
                </div>
                <div className="w-1/2 p-2 border border-gray-300 rounded-md dark:border-slate-600 bg-white dark:bg-slate-700">
                    <DueDateSelector value={endDate} onChange={setEndDate} />
                </div>
            </div>
        </div>

      {/* Type-specific fields */}
      {category === KRCategory.Standard && (
        <>
            <div>
                <label className="block text-sm font-medium text-brand-text">نوع، واحد و جهت</label>
                <div className="flex items-center space-x-2 space-x-reverse mt-1">
                    <select value={unit} onChange={handleUnitChange} className="input-style flex-grow">
                        {UNIT_DEFINITIONS.map(group => (
                            <optgroup key={group.group} label={group.group}>
                                {group.units.map(unitOption => (
                                    <option key={unitOption.value} value={unitOption.value}>{unitOption.label}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <button type="button" onClick={() => setTargetDirection('INCREASING')} className={`p-2 rounded-md transition-all ${targetDirection === 'INCREASING' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-200'}`} title="افزایشی">
                        <ArrowUpIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => setTargetDirection('DECREASING')} className={`p-2 rounded-md transition-all ${targetDirection === 'DECREASING' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 hover:bg-gray-200'}`} title="کاهشی">
                        <ArrowDownIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="flex space-x-4 space-x-reverse">
                <div className="w-1/2">
                    <label htmlFor="kr-start" className="block text-sm font-medium text-brand-text">مقدار اولیه</label>
                    <input type="number" id="kr-start" value={startValue} onChange={(e) => setStartValue(parseFloat(e.target.value) || 0)} className="mt-1 block w-full input-style" />
                </div>
                <div className="w-1/2">
                    <label htmlFor="kr-target" className="block text-sm font-medium text-brand-text">مقدار هدف</label>
                    <input type="number" id="kr-target" value={targetValue} onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)} className="mt-1 block w-full input-style" />
                </div>
            </div>
        </>
      )}
      {category === KRCategory.Stretch && (
         <div className="space-y-3">
             <div>
                <label htmlFor="stretch-target" className="block text-sm font-medium text-brand-text">تارگت اصلی (عدد)</label>
                <input type="number" id="stretch-target" value={stretchTarget} onChange={e => setStretchTarget(parseFloat(e.target.value) || 0)} className="mt-1 block w-full input-style" />
             </div>
             {stretchLevels.map((level, index) => (
                 <div key={index} className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-md">
                    <input type="text" value={level.label} onChange={e => handleStretchLevelChange(index, 'label', e.target.value)} placeholder="عنوان سطح" className="input-style w-1/3" />
                    <input type="number" value={level.value} onChange={e => handleStretchLevelChange(index, 'value', parseFloat(e.target.value) || 0)} placeholder="عدد" className="input-style flex-grow" />
                 </div>
             ))}
         </div>
      )}
      {category === KRCategory.Binary && (
          <div className="flex space-x-4 space-x-reverse">
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-brand-text">برچسب حالت عدم تکمیل</label>
                    <input type="text" value={binaryLabels.incomplete} onChange={e => setBinaryLabels(p => ({...p, incomplete: e.target.value}))} className="mt-1 block w-full input-style" />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-medium text-brand-text">برچسب حالت تکمیل</label>
                    <input type="text" value={binaryLabels.complete} onChange={e => setBinaryLabels(p => ({...p, complete: e.target.value}))} className="mt-1 block w-full input-style" />
                </div>
            </div>
      )}

      <div className={`flex items-center pt-4 ${isModern2Style ? "justify-center space-x-4 space-x-reverse" : "justify-end space-x-2 space-x-reverse"}`}>
        <button type="button" onClick={onCancel} className={`rounded-lg font-semibold ${isModern2Style ? 'px-8 py-4 text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 text-sm'}`}>لغو</button>
        <button type="submit" className={`text-white rounded-lg font-semibold ${isModern2Style ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm'}`} style={{ backgroundColor: styleSettings.primaryColor }}>افزودن</button>
      </div>
    </form>
  );
};

export default NewKeyResultForm;
