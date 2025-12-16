import React, { useState, useEffect, useMemo } from 'react';
import { Objective, ObjectiveCategoryId } from '../types';
import Modal from './Modal';
import { CategorySelector, ParentObjectiveSelector } from './ObjectiveSelectors';
import { OBJECTIVE_COLOR_OPTIONS, OBJECTIVE_COLOR_MAP } from '../constants';
import DueDateSelector from './DueDateSelector';


interface EditObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  objectives: Objective[];
  // FIX: Corrected onSubmit signature
  onSubmit: (objectiveId: string, title: string, description: string, category: ObjectiveCategoryId, parentId: string | undefined, color: string, endDate: string | undefined, isDefault: boolean, quarter: string | undefined) => void;
}

const EditObjectiveModal: React.FC<EditObjectiveModalProps> = ({ isOpen, onClose, objective, objectives, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ObjectiveCategoryId | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDefault, setIsDefault] = useState(false);
  const [quarter, setQuarter] = useState<string>('');


  useEffect(() => {
    if (objective) {
      setTitle(objective.title);
      setDescription(objective.description);
      setCategory(objective.category);
      setParentId(objective.parentId);
      setColor(objective.color || OBJECTIVE_COLOR_OPTIONS[0]);
      setEndDate(objective.endDate || '');
      setIsDefault(objective.isDefault || false);
      setQuarter(objective.quarter || '');
    }
  }, [objective]);

  const quarterOptions = useMemo(() => {
    const options = [];
    const currentPersianYear = parseInt(new Date().toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' }));
    const startYear = currentPersianYear;
    const seasons = [
        { name: 'بهار', q: 'Q1' },
        { name: 'تابستان', q: 'Q2' },
        { name: 'پاییز', q: 'Q3' },
        { name: 'زمستان', q: 'Q4' },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('عنوان هدف الزامی است.');
      return;
    }
    if (!category) {
      alert('لطفا یک دسته بندی انتخاب کنید.');
      return;
    }
    onSubmit(objective.id, title, description, category, parentId, color, endDate || undefined, isDefault, quarter || undefined);
    onClose();
  };
  
  const childObjectives = objectives.filter(o => o.parentId === objective.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ویرایش هدف" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label htmlFor="edit-obj-title" className="block text-sm font-medium text-brand-text">عنوان هدف</label>
          <input
            type="text"
            id="edit-obj-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full input-style"
            required
          />
        </div>
        <div>
          <label htmlFor="edit-obj-desc" className="block text-sm font-medium text-brand-text">توضیحات (اختیاری)</label>
          <textarea
            id="edit-obj-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full input-style"
          ></textarea>
        </div>
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">دسته‌بندی</label>
            <CategorySelector selected={category} onSelect={setCategory} />
        </div>
        <div>
          <label htmlFor="edit-obj-quarter" className="block text-sm font-medium text-brand-text">فصل</label>
          <select
              id="edit-obj-quarter"
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
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">رنگ هدف</label>
            <div className="flex space-x-2 space-x-reverse mt-1">
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
        <div className="flex items-center pt-2">
          <input
            id="is-default-obj"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded ml-2"
          />
          <label htmlFor="is-default-obj" className="text-sm font-medium text-brand-text">
            تنظیم به عنوان هدف پیش فرض
          </label>
        </div>
        <div>
            <label className="block text-sm font-medium text-brand-text mb-2">ددلاین</label>
            <div className="p-2 border border-gray-300 rounded-md mt-1">
                <DueDateSelector value={endDate} onChange={setEndDate} />
            </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium text-brand-text">هم‌راستایی OKR</h3>
            <div>
                <label className="block text-xs font-medium text-brand-subtext mb-1">هدف بالادستی</label>
                <ParentObjectiveSelector
                    objectives={objectives}
                    currentObjectiveId={objective.id}
                    selectedParentId={parentId}
                    onChange={setParentId}
                />
            </div>
            {childObjectives.length > 0 && (
                <div>
                    <label className="block text-xs font-medium text-brand-subtext mb-1">اهداف پایین‌دستی</label>
                    <div className="space-y-1 p-2 bg-gray-100/70 rounded-lg border">
                        {childObjectives.map(child => (
                            <p key={child.id} className="text-sm text-brand-text truncate">{child.title}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>


        <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            لغو
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            ذخیره تغییرات
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditObjectiveModal;
