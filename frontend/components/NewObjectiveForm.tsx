import React, { useState, useMemo, useRef } from 'react';
import { User, ObjectiveCategoryId, Objective, StyleSettings } from '../types';
import { UserIcon, CalendarIcon } from './Icons';
import { UserSelector, CategorySelector, ParentObjectiveSelector } from './ObjectiveSelectors';
import { OBJECTIVE_COLOR_OPTIONS, OBJECTIVE_COLOR_MAP } from '../constants';
import DueDateSelector from './DueDateSelector';


interface NewObjectiveFormProps {
  users: User[];
  objectives: Objective[];
// FIX: Corrected onSubmit signature to match implementation
  onSubmit: (title: string, description: string, ownerId: string, category: ObjectiveCategoryId, parentId: string | undefined, color: string, endDate: string | undefined, quarter: string | undefined) => void;
  onCancel: () => void;
  defaultOwnerId: string;
  styleSettings: StyleSettings;
}

const NewObjectiveForm: React.FC<NewObjectiveFormProps> = ({ users, objectives, onSubmit, onCancel, defaultOwnerId, styleSettings }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState(defaultOwnerId);
  const [category, setCategory] = useState<ObjectiveCategoryId | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string>(OBJECTIVE_COLOR_OPTIONS[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [quarter, setQuarter] = useState<string>('');
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  const isModern2Style = styleSettings.primaryColor === '#F59E0B';

  const quarterOptions = useMemo(() => {
    const options = [];
    const currentPersianYear = parseInt(new Date().toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' }));
    const startYear = currentPersianYear;
    const seasons = [
        { name: 'بهار', q: 'Q1'},
        { name: 'تابستان', q: 'Q2'},
        { name: 'پاییز', q: 'Q3'},
        { name: 'زمستان', q: 'Q4'},
    ];
    for (let i = 0; i < 3; i++) {
        const year = startYear + i;
        seasons.forEach(season => {
            options.push({
                label: `Q${season.q.slice(1)} - ${season.name} ${year}`,
                value: `${year}-${season.q}`,
            });
        });
    }
    return options;
  }, []);


  const handleDescriptionInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setDescription(e.currentTarget.value);
    if(descriptionRef.current){
        descriptionRef.current.style.height = 'auto';
        descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان هدف الزامی است.');
      return;
    }
    if (!category) {
      alert('لطفاً یک دسته‌بندی برای هدف انتخاب کنید.');
      return;
    }
    
    // Only include parentId if it's set and exists in objectives
    let finalParentId: string | undefined = undefined;
    if (parentId && parentId.trim()) {
      const parentExists = objectives.find(obj => obj.id === parentId);
      if (parentExists) {
        finalParentId = parentId;
      }
    }
    
    onSubmit(title, description, ownerId, category, finalParentId, color, endDate || undefined, quarter || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 text-right">
        <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold border-none focus:ring-0 p-1 -m-1 bg-transparent placeholder-gray-400"
              placeholder="یک عنوان قدرتمند برای هدف خود بنویسید..."
              required
            />
            <textarea
              ref={descriptionRef}
              value={description}
              onInput={handleDescriptionInput}
              rows={1}
              className="mt-2 w-full text-md text-brand-subtext border-none focus:ring-0 resize-none p-1 -m-1 bg-transparent placeholder-gray-400"
              placeholder="جزئیات بیشتری درباره این هدف اضافه کنید (اختیاری)"
            ></textarea>
        </div>
        
        <div className="pt-4 space-y-4">
            <div>
                <label className="block text-sm font-medium text-brand-text mb-2">دسته‌بندی</label>
                <CategorySelector selected={category} onSelect={setCategory} />
            </div>
            <div>
                <label htmlFor="new-obj-quarter" className="block text-sm font-medium text-brand-text mb-2">فصل</label>
                <select
                    id="new-obj-quarter"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value)}
                    className="mt-1 block w-full input-style"
                >
                    <option value="">بدون فصل</option>
                    {quarterOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
            {objectives && objectives.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-brand-text mb-2">هم‌راستایی OKR</h3>
                <ParentObjectiveSelector
                    objectives={objectives}
                    selectedParentId={parentId}
                    onChange={setParentId}
                />
              </div>
            )}
        </div>
        
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">رنگ هدف</label>
            <div className="flex space-x-2 space-x-reverse">
                {OBJECTIVE_COLOR_OPTIONS.map(c => (
                <button 
                    key={c} 
                    type="button" 
                    onClick={() => setColor(c)} 
                    className={`w-6 h-6 rounded-full border-2 transition-all ${OBJECTIVE_COLOR_MAP[c].bg} ${color === c ? 'ring-2 ring-offset-1 ring-brand-primary border-white' : 'border-transparent'}`}
                />
                ))}
            </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200">
             <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
                <div className="flex items-center text-sm text-brand-subtext">
                    <UserIcon className="w-5 h-5 ml-2"/>
                    <span>مالک</span>
                </div>
                <UserSelector users={users} selectedUserId={ownerId} onChange={setOwnerId} />
             </div>
             <div className="grid grid-cols-[auto,1fr] items-center gap-x-4">
                <div className="flex items-center text-sm text-brand-subtext">
                    <CalendarIcon className="w-5 h-5 ml-2"/>
                    <span>ددلاین</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-gray-100">
                    <DueDateSelector value={endDate} onChange={setEndDate} />
                </div>
             </div>
        </div>
      
      <div className={`flex items-center pt-6 border-t ${isModern2Style ? "justify-center space-x-4 space-x-reverse" : "justify-end space-x-2 space-x-reverse"}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-lg font-semibold transition-colors ${isModern2Style ? 'px-8 py-4 text-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'px-4 py-2 text-sm bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
        >
          لغو
        </button>
        <button
          type="submit"
          className={`text-white rounded-lg transition-colors font-semibold ${isModern2Style ? 'px-8 py-4 text-lg' : 'px-4 py-2 text-sm'}`}
          style={{ backgroundColor: styleSettings.primaryColor }}
        >
          مرحله بعد
        </button>
      </div>
    </form>
  );
};

export default NewObjectiveForm;
