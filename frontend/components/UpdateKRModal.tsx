import React, { useState, useEffect, useRef, useMemo } from 'react';
// FIX: Added missing import for FeedbackTag
import { KeyResult, KRCategory, FeedbackTag, Objective, User, KRType, KRStatus } from '../types';
import Modal from './Modal';
import { CheckCircleIcon, XCircleIcon, ICONS, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { UNIT_DEFINITIONS } from '../constants';

declare var confetti: any;

const ModernProgressBar: React.FC<{ start: number; end: number; current: number; direction: 'INCREASING' | 'DECREASING' }> = ({ start, end, current, direction }) => {
    let progressPercent = 0;

    if (direction === 'DECREASING') {
        const totalDistance = start - end;
        const distanceCovered = start - current;
        if (totalDistance > 0) {
            progressPercent = (distanceCovered / totalDistance) * 100;
        } else {
            progressPercent = current <= end ? 100 : 0;
        }
    } else { // INCREASING
        const totalDistance = end - start;
        const distanceCovered = current - start;
        if (totalDistance > 0) {
            progressPercent = (distanceCovered / totalDistance) * 100;
        } else {
            progressPercent = current >= end ? 100 : 0;
        }
    }

    progressPercent = Math.max(0, Math.min(100, progressPercent));

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-gray-500 dark:text-slate-400">
                <span>{start.toLocaleString('fa-IR')}</span>
                <span>{end.toLocaleString('fa-IR')}</span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-slate-700 rounded-full">
                <div className="absolute h-3 bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                <div className="absolute top-0 bottom-0 flex items-center transition-all duration-300" style={{ right: `calc(${progressPercent}% - 10px)` }}>
                    <div className="w-5 h-5 bg-white dark:bg-slate-300 border-2 border-teal-500 rounded-full shadow"></div>
                </div>
            </div>
        </div>
    );
};


interface UpdateKRModalProps {
    isOpen: boolean;
    onClose: () => void;
    kr: KeyResult;
    onSubmit: (objectiveId: string, krId: string, value: number, rating: number, report: { tasksDone: string; tasksNext: string; challenges: string; }, challengeDifficulty: number, challengeTagIds: string[], status: KRStatus) => void;
    challengeTags: FeedbackTag[];
    objectives: Objective[];
}

const UnitAndDirection: React.FC<{ kr: KeyResult }> = ({ kr }) => {
    const directionIcon = kr.targetDirection === 'DECREASING' 
        ? <ArrowDownIcon className="w-4 h-4 text-red-500" />
        : <ArrowUpIcon className="w-4 h-4 text-green-500" />;
    
    const unitDefinition = useMemo(() => {
        if (!kr.unit) return null;
        for (const group of UNIT_DEFINITIONS) {
            const found = group.units.find(u => u.value === kr.unit);
            if (found) return found;
        }
        return null;
    }, [kr.unit]);
    
    const unitLabel = kr.type === KRType.Percentage ? '%' : (unitDefinition?.label || kr.unit);


    return (
         <div className="flex items-center space-x-1 space-x-reverse text-gray-500 dark:text-slate-400">
            {directionIcon}
            <span className="text-sm font-medium">{unitLabel}</span>
        </div>
    );
};


const UpdateKRModal: React.FC<UpdateKRModalProps> = ({ isOpen, onClose, kr, onSubmit, challengeTags, objectives }) => {
    const [checkInValue, setCheckInValue] = useState<number>(0);
    const [newCurrentValue, setNewCurrentValue] = useState(kr.currentValue);
    const [confidence, setConfidence] = useState<number>(7);
    const [status, setStatus] = useState<KRStatus>('NEEDS_ATTENTION');
    const [selectedChallengeTags, setSelectedChallengeTags] = useState<string[]>([]);
    
    const tasksDoneRef = useRef<HTMLDivElement>(null);
    const tasksNextRef = useRef<HTMLDivElement>(null);
    const challengesRef = useRef<HTMLTextAreaElement>(null);

    const statusMap: Record<KRStatus, { label: string, color: string }> = {
        ON_TRACK: { label: 'در مسیر', color: 'text-green-600' },
        NEEDS_ATTENTION: { label: 'نیاز به توجه', color: 'text-yellow-600' },
        OFF_TRACK: { label: 'خارج از مسیر', color: 'text-orange-600' },
        CHALLENGE: { label: 'توقف OKR', color: 'text-red-700 font-bold' },
    };

    useEffect(() => {
        if (confidence > 7) {
            setStatus('ON_TRACK');
        } else if (confidence >= 4) {
            setStatus('NEEDS_ATTENTION');
        } else if (confidence >= 1) {
            setStatus('OFF_TRACK');
        } else {
            setStatus('CHALLENGE');
        }
    }, [confidence]);

    useEffect(() => {
        setNewCurrentValue(kr.currentValue);
        setCheckInValue(0);
        setConfidence(7);
        setSelectedChallengeTags([]);
        if (tasksDoneRef.current) tasksDoneRef.current.innerHTML = '';
        if (tasksNextRef.current) tasksNextRef.current.innerHTML = '';
        if (challengesRef.current) challengesRef.current.value = '';
    }, [kr, isOpen]);

    const handleCheckInValueChange = (valStr: string) => {
        const val = parseFloat(valStr) || 0;
        setCheckInValue(val);
        const updated = kr.currentValue + val;
        setNewCurrentValue(updated);
    };

    const handleTagToggle = (tagId: string) => {
        setSelectedChallengeTags(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const report = {
            tasksDone: tasksDoneRef.current?.innerHTML || '',
            tasksNext: tasksNextRef.current?.innerHTML || '',
            challenges: challengesRef.current?.value || '',
        };
        const objectiveId = objectives.find(o => o.keyResults.some(k => k.id === kr.id))!.id;
        onSubmit(objectiveId, kr.id, newCurrentValue, confidence, report, 3, selectedChallengeTags, status);
        onClose();
    };
    

    const renderProgressInput = () => {
        switch(kr.category) {
            case KRCategory.Standard:
            case KRCategory.Stretch:
                return (
                     <div className="space-y-6">
                        <ModernProgressBar
                            start={kr.startValue ?? 0}
                            end={kr.targetValue ?? 0}
                            current={newCurrentValue}
                            direction={kr.targetDirection || 'INCREASING'}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">مقدار هدف</label>
                                <div className="mt-1 flex items-baseline justify-center space-x-2 space-x-reverse">
                                    <p className="text-xl font-bold text-gray-800 dark:text-slate-200">{(kr.targetValue || 0).toLocaleString('fa-IR')}</p>
                                    <UnitAndDirection kr={kr} />
                                </div>
                            </div>
                            <div className="border-l border-r border-gray-200 dark:border-slate-600 px-4">
                                <label className="block text-sm font-medium text-gray-500 dark:text-slate-400">مقدار فعلی (جدید)</label>
                                 <div className="mt-1 flex items-baseline justify-center space-x-2 space-x-reverse">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{newCurrentValue.toLocaleString('fa-IR')}</p>
                                     <UnitAndDirection kr={kr} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="checkin-value" className="block text-sm font-medium text-gray-500 dark:text-slate-400">مقدار پیشرفت اکنون</label>
                                <div className="mt-1 flex items-baseline justify-center space-x-2 space-x-reverse">
                                    <input 
                                        id="checkin-value"
                                        type="number"
                                        value={checkInValue}
                                        onChange={e => handleCheckInValueChange(e.target.value)}
                                        className="w-2/3 text-center text-xl font-bold border-0 border-b-2 focus:ring-0 focus:border-blue-500 p-0 bg-transparent dark:text-slate-200"
                                    />
                                    <UnitAndDirection kr={kr} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case KRCategory.Binary:
                return (
                     <div className="flex items-center space-x-4 space-x-reverse">
                        <button type="button" onClick={() => setNewCurrentValue(0)} className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg text-lg transition-all ${newCurrentValue === 0 ? 'bg-red-50 border-red-500 text-red-800 font-semibold' : 'text-gray-600 border-gray-300 hover:border-red-400'}`}><XCircleIcon className="w-6 h-6 ml-2"/> {kr.binaryLabels?.incomplete || 'انجام نشده'}</button>
                        <button type="button" onClick={() => setNewCurrentValue(1)} className={`flex-1 flex items-center justify-center p-3 border-2 rounded-lg text-lg transition-all ${newCurrentValue === 1 ? 'bg-green-50 border-green-500 text-green-800 font-semibold' : 'text-gray-600 border-gray-300 hover:border-green-400'}`}><CheckCircleIcon className="w-6 h-6 ml-2"/> {kr.binaryLabels?.complete || 'انجام شد'}</button>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`بروزرسانی: ${kr.title}`} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                {renderProgressInput()}

                <div className="border-t pt-6">
                    <label htmlFor="confidence-slider" className="block text-sm font-medium text-gray-700 dark:text-slate-300 text-center mb-4">
                        سطح اطمینان دستیابی به این هدف را چطور ارزیابی می‌کنید؟
                    </label>
                    <div className="flex items-center space-x-4 space-x-reverse px-4">
                        <span className="text-sm font-bold text-gray-500">۰</span>
                        <input
                            id="confidence-slider"
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={confidence}
                            onChange={e => setConfidence(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <span className="text-sm font-bold text-gray-500">۱۰</span>
                        <div className="w-28 text-center flex-shrink-0">
                            <div className="text-2xl font-bold">{confidence}</div>
                            <div className={`text-xs font-semibold ${statusMap[status].color}`}>{statusMap[status].label}</div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t pt-6">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-200 mb-4">گزارش کار</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="tasks-done" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">✅  کارهایی که این هفته انجام شده است</label>
                            <div
                                ref={tasksDoneRef}
                                id="tasks-done"
                                contentEditable
                                className="w-full p-3 min-h-[100px] whitespace-pre-wrap bg-gray-50/70 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="tasks-next" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">🗓️  کارهایی که برای هفته بعد برنامه‌ریزی شده</label>
                            <div
                                ref={tasksNextRef}
                                id="tasks-next"
                                contentEditable
                                className="w-full p-3 min-h-[100px] whitespace-pre-wrap bg-gray-50/70 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="challenges" className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">⚠️  چالش‌ها و موانع</label>
                            <textarea 
                                ref={challengesRef} 
                                id="challenges" 
                                rows={4} 
                                className="w-full p-3 bg-gray-50/70 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                </div>
                
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">برچسب چالش</label>
                    <div className="flex flex-wrap gap-2">
                        {challengeTags.map(tag => {
                            const Icon = ICONS[tag.icon];
                            const isSelected = selectedChallengeTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleTagToggle(tag.id)}
                                    className={`flex items-center px-3 py-1.5 border rounded-full text-sm font-medium transition-all ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:border-gray-400'}`}
                                >
                                    <Icon className="w-4 h-4 ml-2" style={{ color: isSelected ? '#fff' : tag.color }} />
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                 </div>

                <div className="flex justify-end pt-6 border-t dark:border-slate-700">
                    <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg">ثبت بروزرسانی</button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateKRModal;
