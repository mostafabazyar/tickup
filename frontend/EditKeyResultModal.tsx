import React, { useState, useEffect, useMemo } from 'react';
import { KeyResult, User, KRType, KRCategory, StretchLevel, ReportFrequency } from '../types';
import Modal from './Modal';
import { PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import DueDateSelector from './DueDateSelector';
import { UNIT_DEFINITIONS } from '../constants';


interface EditKeyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  kr: KeyResult;
  objectiveId: string;
  users: User[];
  onUpdate: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
}

const EditKeyResultModal: React.FC<EditKeyResultModalProps> = ({ isOpen, onClose, kr, objectiveId, users, onUpdate }) => {
    // State for all possible fields
    const [title, setTitle] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportFrequency, setReportFrequency] = useState<ReportFrequency>('DAILY');

    // Standard fields
    const [krType, setKrType] = useState<KRType>(KRType.Number);
    const [unit, setUnit] = useState<string>('number');
    const [startValue, setStartValue] = useState(0);
    const [targetValue, setTargetValue] = useState(100);
    const [targetDirection, setTargetDirection] = useState<'INCREASING' | 'DECREASING'>('INCREASING');

    // Stretch fields
    const [stretchLevels, setStretchLevels] = useState<StretchLevel[]>([]);

    // Binary fields
    const [binaryLabels, setBinaryLabels] = useState({ incomplete: '', complete: '' });
    
    // Weekly Target fields
    const [weeklyTargets, setWeeklyTargets] = useState<number[]>([]);
    
    // Daily Target field
    const [dailyTargetValue, setDailyTargetValue] = useState<number>(0);

    const selectedUnitLabel = useMemo(() => {
        if (!unit) return '';
        for (const group of UNIT_DEFINITIONS) {
            const foundUnit = group.units.find(u => u.value === unit);
            if (foundUnit) {
                return foundUnit.label;
            }
        }
        return '';
    }, [unit]);

    useEffect(() => {
        if (kr) {
            setTitle(kr.title);
            setOwnerId(kr.ownerId);
            setStartDate(kr.startDate || '');
            setEndDate(kr.endDate || '');
            setReportFrequency(kr.reportFrequency || 'DAILY');
            setWeeklyTargets(kr.weeklyTargets || []);
            setDailyTargetValue(kr.dailyTarget?.target || 0);
            setTargetDirection(kr.targetDirection || 'INCREASING');
            
            setKrType(kr.type || KRType.Number);
            if (kr.unit) {
                setUnit(kr.unit);
            } else if (kr.type === KRType.Percentage) {
                setUnit('percentage');
            } else {
                setUnit('number');
            }

            switch (kr.category) {
                case KRCategory.Standard:
                    setStartValue(kr.startValue || 0);
                    setTargetValue(kr.targetValue || 0);
                    break;
                case KRCategory.Stretch:
                    setStretchLevels(kr.stretchLevels || []);
                    setStartValue(kr.startValue || 0);
                    setTargetValue(kr.targetValue || 0);
                    break;
                case KRCategory.Binary:
                    setBinaryLabels(kr.binaryLabels || { incomplete: 'انجام نشده', complete: 'انجام شد' });
                    break;
            }
        }
    }, [kr, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUnit = unit === 'number' || unit === 'percentage' ? undefined : unit;
        const updates: Partial<KeyResult> = { title, ownerId, startDate: startDate || undefined, endDate: endDate || undefined, reportFrequency, targetDirection };

        switch (kr.category) {
            case KRCategory.Standard:
                updates.type = krType;
                updates.unit = finalUnit;
                updates.startValue = startValue;
                updates.targetValue = targetValue;
                if (reportFrequency === 'WEEKLY') {
                    updates.weeklyTargets = weeklyTargets;
                    updates.dailyTarget = undefined;
                } else { // DAILY
                    updates.dailyTarget = {
                        ...(kr.dailyTarget || { current: 0 }),
                        type: krType,
                        target: dailyTargetValue,
                        unit: finalUnit,
                    };
                    updates.weeklyTargets = undefined;
                }
                break;
            case KRCategory.Stretch:
                updates.stretchLevels = stretchLevels;
                updates.startValue = startValue;
                updates.targetValue = targetValue;
                updates.targetDirection = targetDirection;
                 if (reportFrequency === 'WEEKLY') {
                    updates.weeklyTargets = weeklyTargets;
                    updates.dailyTarget = undefined;
                } else { // DAILY
                    updates.dailyTarget = {
                        ...(kr.dailyTarget || { current: 0 }),
                        type: kr.type || KRType.Number, // Stretch goals are numeric
                        target: dailyTargetValue,
                    };
                    updates.weeklyTargets = undefined;
                }
                break;
            case KRCategory.Binary:
                updates.binaryLabels = binaryLabels;
                break;
        }

        onUpdate(objectiveId, kr.id, updates);
        onClose();
    };

    const handleStretchLevelChange = (index: number, field: keyof StretchLevel, value: string | number) => {
        const newLevels = [...stretchLevels];
        (newLevels[index] as any)[field] = value;
        setStretchLevels(newLevels);
    };
    
    const handleWeeklyTargetChange = (index: number, value: number) => {
        const newTargets = [...weeklyTargets];
        newTargets[index] = value;
        setWeeklyTargets(newTargets);
    };

    const handleAddWeek = () => {
        const lastTarget = weeklyTargets[weeklyTargets.length - 1] || 0;
        setWeeklyTargets(prev => [...prev, lastTarget]);
    };

    const handleRemoveWeek = (index: number) => {
        setWeeklyTargets(prev => prev.filter((_, i) => i !== index));
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUnitValue = e.target.value;
        setUnit(selectedUnitValue);

        // Find the type associated with this unit
        for (const group of UNIT_DEFINITIONS) {
            const foundUnit = group.units.find(u => u.value === selectedUnitValue);
            if (foundUnit) {
                setKrType(foundUnit.type);
                break;
            }
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ویرایش نتیجه کلیدی">
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
                <div>
                    <label className="block text-sm font-medium text-brand-text">عنوان</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-brand-text">مالک</label>
                    <select value={ownerId} onChange={e => setOwnerId(e.target.value)} className="input-style">
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                </div>
                
                <div className="flex space-x-4 space-x-reverse">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-brand-text">تاریخ شروع</label>
                        <div className="p-2 border border-gray-300 rounded-md mt-1">
                           <DueDateSelector value={startDate} onChange={setStartDate} />
                        </div>
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-brand-text">تاریخ پایان</label>
                        <div className="p-2 border border-gray-300 rounded-md mt-1">
                           <DueDateSelector value={endDate} onChange={setEndDate} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-brand-text">نوع گزارش تارگت</label>
                    <select value={reportFrequency} onChange={e => setReportFrequency(e.target.value as ReportFrequency)} className="input-style">
                        <option value="DAILY">روزانه</option>
                        <option value="WEEKLY">هفته ای</option>
                    </select>
                </div>

                {kr.category === KRCategory.Standard && (
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
                                <label htmlFor="kr-start-value" className="block text-sm font-medium text-brand-text">مقدار اولیه</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        id="kr-start-value"
                                        type="number"
                                        value={startValue}
                                        onChange={e => setStartValue(parseFloat(e.target.value) || 0)}
                                        className="block w-full border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                                    />
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400">
                                        {selectedUnitLabel}
                                    </span>
                                </div>
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="kr-target-value" className="block text-sm font-medium text-brand-text">مقدار هدف</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input
                                        id="kr-target-value"
                                        type="number"
                                        value={targetValue}
                                        onChange={e => setTargetValue(parseFloat(e.target.value) || 0)}
                                        className="block w-full border border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                                    />
                                     <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400">
                                        {selectedUnitLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {kr.category === KRCategory.Stretch && (
                     <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-brand-text">تارگت اصلی (عدد)</label>
                            <input type="number" value={targetValue} onChange={e => setTargetValue(parseFloat(e.target.value) || 0)} className="input-style" />
                        </div>
                        {stretchLevels.map((level, index) => (
                            <div key={index} className="flex items-center space-x-2 space-x-reverse p-2 bg-gray-50 rounded-md">
                                <input type="text" value={level.label} onChange={e => handleStretchLevelChange(index, 'label', e.target.value)} placeholder="عنوان سطح" className="input-style w-1/3" />
                                <input type="number" value={level.value} onChange={e => handleStretchLevelChange(index, 'value', parseFloat(e.target.value) || 0)} placeholder="عدد" className="input-style flex-grow" />
                            </div>
                        ))}
                    </div>
                )}
                {kr.category === KRCategory.Binary && (
                    <div className="flex space-x-4 space-x-reverse">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-brand-text">برچسب حالت عدم تکمیل</label>
                            <input type="text" value={binaryLabels.incomplete} onChange={e => setBinaryLabels(p => ({...p, incomplete: e.target.value}))} className="input-style" />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-brand-text">برچسب حالت تکمیل</label>
                            <input type="text" value={binaryLabels.complete} onChange={e => setBinaryLabels(p => ({...p, complete: e.target.value}))} className="input-style" />
                        </div>
                    </div>
                )}
                
                {(kr.category === KRCategory.Standard || kr.category === KRCategory.Stretch) && (
                    <div className="border-t pt-4">
                        {reportFrequency === 'WEEKLY' ? (
                            <>
                                <h4 className="text-sm font-medium text-brand-text mb-2">تارگت هفتگی</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {weeklyTargets.map((target, index) => (
                                        <div key={index} className="flex items-center space-x-2 space-x-reverse">
                                            <label className="text-sm w-20 flex-shrink-0">هفته {index + 1}</label>
                                            <input
                                                type="number"
                                                value={target}
                                                onChange={(e) => handleWeeklyTargetChange(index, parseFloat(e.target.value) || 0)}
                                                className="input-style flex-grow"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveWeek(index)}
                                                className="p-1 text-gray-400 hover:text-red-500 rounded-full"
                                                title="حذف هفته"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddWeek}
                                    className="mt-2 text-sm text-brand-primary flex items-center font-semibold"
                                >
                                    <PlusIcon className="w-4 h-4 ml-1" />
                                    افزودن هفته
                                </button>
                            </>
                        ) : ( // DAILY
                             <>
                                <h4 className="text-sm font-medium text-brand-text mb-2">تارگت روزانه</h4>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <label className="text-sm w-20 flex-shrink-0">هر روز</label>
                                    <input
                                        type="number"
                                        value={dailyTargetValue}
                                        onChange={(e) => setDailyTargetValue(parseFloat(e.target.value) || 0)}
                                        className="input-style flex-grow"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}


                <div className="flex justify-end pt-4 space-x-2 space-x-reverse">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">لغو</button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-blue-700">ذخیره</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditKeyResultModal;