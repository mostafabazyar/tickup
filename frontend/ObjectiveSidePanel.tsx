import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Objective, User, KeyResult, Strategy, Index, Board, CheckIn, Comment, FeedbackTag, Project, Task, KRStatus, Document, ActivePage, ObjectiveCategoryId } from './types';
import { CloseIcon, UserIcon, RocketIcon, StarIcon, Squares2x2Icon, ICONS, ArrowUpIcon, ArrowDownIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, FlagIcon, PlusIcon, DocumentTextIcon, ViewColumnsIcon, TrashIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, EditIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon, ThreeDotsIcon, SparklesIcon } from './components/Icons';
import ProgressBar from './components/ProgressBar';
import ProgressChart from './components/ProgressChart';
import { OBJECTIVE_CATEGORIES } from './constants';
import { calculateObjectiveProgress, calculateKrProgress } from './utils/objectiveUtils';
import UpdateKRModal from './components/UpdateKRModal';
import Comments from './components/Comments';
import { toPersianDate, dayDiff, isSameUTCDay } from './utils/dateUtils';
import { useClickOutside } from './components/ObjectiveSelectors';
import Modal from './components/Modal';
import { Banner } from './components/KrBanner';


interface TargetProgressIndicatorProps {
  kr: KeyResult;
}

const TargetProgressIndicator: React.FC<TargetProgressIndicatorProps> = ({ kr }) => {
    const [page, setPage] = useState(0);

    const isDailyMode = kr.reportFrequency === 'DAILY';
    const { startDate, endDate, checkIns, reportFrequency, weeklyTargets, dailyTarget, startValue = 0 } = kr;

    const start = startDate ? new Date(startDate) : new Date();
    // Default end date: 12 weeks for weekly, 90 days for daily
    const defaultEndDate = new Date(start);
    if (isDailyMode) {
        defaultEndDate.setDate(start.getDate() + 89);
    } else {
        defaultEndDate.setDate(start.getDate() + 12 * 7 - 1);
    }
    const end = endDate ? new Date(endDate) : defaultEndDate;

    const totalDuration = isDailyMode 
        ? dayDiff(end, start) + 1
        : Math.ceil((dayDiff(end, start) + 1) / 7);

    const itemsPerPage = isDailyMode ? 28 : 12; // 4 weeks of 7 days for daily, 3 rows of 4 for weekly
    const totalPages = Math.ceil(totalDuration / itemsPerPage);

    const startIndex = page * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalDuration);

    const sortedCheckIns = useMemo(() => (checkIns || []).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [checkIns]);
    const now = new Date();
    
    const squares = [];
    for (let i = startIndex; i < endIndex; i++) {
        let statusColor = 'bg-gray-200 dark:bg-slate-600'; // Future
        let content: React.ReactNode = null;
        let title = '';

        const periodStartDate = new Date(start);
        if (isDailyMode) {
            periodStartDate.setUTCDate(start.getUTCDate() + i);
        } else { // WEEKLY
            periodStartDate.setUTCDate(start.getUTCDate() + i * 7);
        }
        
        const persianDate = toPersianDate(periodStartDate.toISOString());

        if (periodStartDate > now) {
            title = `${isDailyMode ? 'روز' : 'هفته'} ${i + 1} (آینده)\n${persianDate}`;
        } else {
            const checkInsForPeriod = isDailyMode 
                ? sortedCheckIns.filter(ci => isSameUTCDay(new Date(ci.date), periodStartDate))
                : sortedCheckIns.filter(ci => {
                    const ciDate = new Date(ci.date);
                    const weekEndDate = new Date(periodStartDate);
                    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
                    weekEndDate.setUTCHours(23, 59, 59, 999);
                    return ciDate >= periodStartDate && ciDate <= weekEndDate;
                });
            
            const target = isDailyMode ? (dailyTarget?.target || 0) : (weeklyTargets?.[i] ?? 0);
            
            if (checkInsForPeriod.length === 0) {
                statusColor = 'bg-gray-300 dark:bg-slate-500';
                title = `${isDailyMode ? 'روز' : 'هفته'} ${i + 1} (بدون گزارش)\n${persianDate}\nتارگت: ${target?.toFixed(1) ?? 'N/A'}`;
            } else if (target === 0) {
                statusColor = 'bg-gray-100 dark:bg-slate-700';
                content = <div className="w-2 h-2 bg-blue-400 rounded-full" title="بدون تارگت"></div>;
                title = `${isDailyMode ? 'روز' : 'هفته'} ${i + 1} (بدون تارگت)\n${persianDate}`;
            } else {
                 const lastCheckInThisPeriod = checkInsForPeriod[checkInsForPeriod.length - 1];
                 const lastCheckInBeforeThisPeriod = sortedCheckIns.slice().reverse().find(ci => new Date(ci.date) < periodStartDate);
                 const cumulativeAtStart = lastCheckInBeforeThisPeriod ? lastCheckInBeforeThisPeriod.value : startValue;
                 const cumulativeAtEnd = lastCheckInThisPeriod.value;
                 const actualProgress = Math.abs(cumulativeAtEnd - cumulativeAtStart);

                 title = `${isDailyMode ? 'روز' : 'هفته'} ${i + 1}\n${persianDate}\nپیشرفت: ${actualProgress.toFixed(1)}\nتارگت: ${target.toFixed(1)}`;
                 
                 let status: 'met' | 'exceeded' | 'below' = 'below';
                 const epsilon = 0.01;
                 const progressRatio = (target > 0) ? (actualProgress / target) : 0;
                 
                 if (progressRatio > 1 + epsilon) {
                    status = 'exceeded';
                 } else if (progressRatio >= 1 - epsilon) {
                    status = 'met';
                 }
                
                statusColor = 'bg-gray-100 dark:bg-slate-700';

                 switch (status) {
                    case 'met':
                        content = <CheckIcon className="w-3 h-3 text-green-500" />;
                        break;
                    case 'exceeded':
                        content = <div className="w-3 h-3 rounded-full bg-black flex items-center justify-center"><CheckIcon className="w-2 h-2 text-green-400" /></div>;
                        break;
                    case 'below':
                        content = <ExclamationTriangleIcon className="w-3 h-3 text-orange-500" />;
                        break;
                 }
            }
        }
        squares.push(<div key={i} title={title} className={`w-4 h-4 rounded-sm flex items-center justify-center ${statusColor}`}>{content}</div>);
    }

    return (
        <div className="flex items-center space-x-2 space-x-reverse">
            {totalPages > 1 && (
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30">
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            )}
            <div className={`grid ${isDailyMode ? 'grid-cols-7' : 'grid-cols-4'} gap-1 w-fit`}>
                {squares}
            </div>
            {totalPages > 1 && (
                 <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30">
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};


interface KeyResultDetailTabProps {
    kr: KeyResult;
    objectiveId: string;
    onCheckin: (objectiveId: string, krId: string, value: number, rating: number, report: { tasksDone: string; tasksNext: string; challenges: string; }, challengeDifficulty: number, challengeTagIds: string[], status: KRStatus) => void;
    onAddComment: (objectiveId: string, krId: string, text: string) => void;
    challengeTags: FeedbackTag[];
    objectives: Objective[];
    projects: Project[];
    tasks: Task[];
    users: User[];
    currentUser: User;
    onSelectTask: (taskId: string) => void;
    onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
    boards: Board[];
    documents: Document[];
    onOpenDocument: (docId: string, options?: { readOnly: boolean }) => void;
    onNavigateToBoardFromKR: (boardId: string, objectiveId: string, krId: string) => void;
    onEditKeyResult: (krId: string) => void;
    onOpenProgramDesigner: (objectiveId: string, krId: string) => void;
}

const KeyResultDetailTab: React.FC<KeyResultDetailTabProps> = ({ kr, objectiveId, onCheckin, onAddComment, challengeTags, objectives, projects, tasks, users, currentUser, onSelectTask, onUpdateKeyResultDetails, boards, documents, onOpenDocument, onNavigateToBoardFromKR, onEditKeyResult, onOpenProgramDesigner }) => {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);
    const boardButtonRef = useRef<HTMLButtonElement>(null);
    const boardPopoverRef = useRef<HTMLDivElement>(null);
    const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(false);
    const docButtonRef = useRef<HTMLButtonElement>(null);
    const docPopoverRef = useRef<HTMLDivElement>(null);
    const [isKrMenuOpen, setIsKrMenuOpen] = useState(false);
    const krMenuButtonRef = useRef<HTMLButtonElement>(null);
    const krMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside(boardPopoverRef, () => setIsBoardSelectorOpen(false), boardButtonRef);
    useClickOutside(docPopoverRef, () => setIsDocSelectorOpen(false), docButtonRef);
    useClickOutside(krMenuRef, () => setIsKrMenuOpen(false), krMenuButtonRef);
    const progress = calculateKrProgress(kr);

    const canCheckIn = useMemo(() => {
        if (!kr.reportFrequency || kr.reportFrequency === 'DAILY') {
            const lastCheckInDate = kr.checkIns && kr.checkIns.length > 0
                ? new Date(kr.checkIns[kr.checkIns.length - 1].date)
                : null;
            if (lastCheckInDate) {
                const today = new Date();
                if (lastCheckInDate.getFullYear() === today.getFullYear() &&
                    lastCheckInDate.getMonth() === today.getMonth() &&
                    lastCheckInDate.getDate() === today.getDate()) {
                    return false; // Already checked in today
                }
            }
            return true;
        }
        if (kr.reportFrequency === 'WEEKLY') {
            const todayDay = new Date().getDay(); // Sunday is 0, Thursday is 4, Friday is 5
            return todayDay === 4 || todayDay === 5;
        }
        return true;
    }, [kr.checkIns, kr.reportFrequency]);

    const checkInDisabledTooltip = useMemo(() => {
        if (canCheckIn) return 'ثبت پیشرفت جدید';
        if (kr.reportFrequency === 'WEEKLY') {
            return 'گزارش هفتگی فقط در روزهای پنج‌شنبه و جمعه امکان‌پذیر است';
        }
        if (kr.reportFrequency === 'DAILY') {
            return 'شما امروز قبلاً گزارش ثبت کرده‌اید';
        }
        return '';
    }, [canCheckIn, kr.reportFrequency]);

    const STATUSES: { id: KRStatus; label: string; color: 'green' | 'yellow' | 'red' | 'orange'; Icon: React.FC<any> }[] = [
        { id: 'ON_TRACK', label: 'در مسیر', color: 'green', Icon: CheckCircleIcon },
        { id: 'NEEDS_ATTENTION', label: 'نیاز به توجه', color: 'yellow', Icon: ExclamationTriangleIcon },
        { id: 'OFF_TRACK', label: 'خارج از مسیر', color: 'orange', Icon: XCircleIcon },
        { id: 'CHALLENGE', label: 'توقف OKR', color: 'red', Icon: FlagIcon }
    ];

    if (!kr) return null;

    const handleSubmitCheckin = (krId: string, value: number, rating: number, report: { tasksDone: string; tasksNext: string; challenges: string; }, challengeDifficulty: number, challengeTagIds: string[], status: KRStatus) => {
        onCheckin(objectiveId, krId, value, rating, report, challengeDifficulty, challengeTagIds, status);
    };

    const linkedBoard = kr.linkedBoardId ? boards.find(b => b.id === kr.linkedBoardId) : null;
    const linkedDocuments = (kr.linkedDocumentIds || []).map(id => documents.find(d => d.id === id)).filter((d): d is Document => !!d);

    const projectIdsForObjective = useMemo(() => 
        projects.filter(p => p.objectiveId === objectiveId).map(p => p.id)
    , [projects, objectiveId]);
    
    const availableBoards = useMemo(() => 
        boards.filter(b => projectIdsForObjective.includes(b.projectId as string))
    , [boards, projectIdsForObjective]);

    const handleBoardClick = (boardId: string) => {
        onNavigateToBoardFromKR(boardId, objectiveId, kr.id);
    };

    const handleToggleDocument = (docId: string) => {
        const currentIds = kr.linkedDocumentIds || [];
        const newIds = currentIds.includes(docId) ? currentIds.filter(id => id !== docId) : [...currentIds, docId];
        onUpdateKeyResultDetails(objectiveId, kr.id, { linkedDocumentIds: newIds });
    };
    
    const handleImageUpload = (dataUrl: string) => {
        onUpdateKeyResultDetails(objectiveId, kr.id, { bannerImageUrl: dataUrl });
    };

    const handleRemoveImage = () => {
        onUpdateKeyResultDetails(objectiveId, kr.id, { bannerImageUrl: undefined });
    };


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="-mx-6 -mt-6 mb-6">
                <Banner
                    imageUrl={kr.bannerImageUrl}
                    isEditable={true}
                    onImageUpload={handleImageUpload}
                    onRemoveImage={handleRemoveImage}
                    altText={`Banner for ${kr.title}`}
                />
            </div>
            <div className="group relative flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold text-brand-text">{kr.title}</h3>
                    <p className="mt-2 text-brand-subtext">جزئیات و پیشرفت این نتیجه کلیدی.</p>
                </div>
                 <div className="relative">
                    <button
                        ref={krMenuButtonRef}
                        onClick={() => setIsKrMenuOpen(p => !p)}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-200/80 hover:text-blue-600"
                        title="گزینه‌ها"
                    >
                        <ThreeDotsIcon className="w-5 h-5" />
                    </button>
                    {isKrMenuOpen && (
                        <div ref={krMenuRef} className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-10 py-1">
                            <button onClick={() => { onEditKeyResult(kr.id); setIsKrMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <EditIcon className="w-4 h-4 ml-2" />
                                ویرایش نتیجه کلیدی
                            </button>
                            <button onClick={() => { onOpenProgramDesigner(objectiveId, kr.id); setIsKrMenuOpen(false); }} className="w-full text-right flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <SparklesIcon className="w-4 h-4 ml-2 text-purple-500" />
                                پیشنهاد فرضیه
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse py-4">
                <div className="flex-grow">
                    <ProgressBar progress={progress} colorClass="bg-blue-500" showPercentage={true} heightClass="h-5" />
                </div>
                <TargetProgressIndicator kr={kr} />
            </div>
            
            <div className="border-t pt-4">
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    {STATUSES.map(statusInfo => {
                        const isActive = kr.status === statusInfo.id;
                        const colors = {
                            green: { active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
                            yellow: { active: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
                            red: { active: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
                            orange: { active: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' }
                        };
                        const activeClasses = colors[statusInfo.color].active;
                        const inactiveClasses = 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 opacity-70';

                        return (
                            <div
                                key={statusInfo.id}
                                className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-default ${isActive ? activeClasses : inactiveClasses}`}
                                title={isActive ? `وضعیت فعلی: ${statusInfo.label}` : statusInfo.label}
                            >
                                <statusInfo.Icon className="w-5 h-5 ml-2" />
                                <span>{statusInfo.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>


            <div className="border-t pt-6">
                <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    disabled={!canCheckIn}
                    className="w-full px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={checkInDisabledTooltip}
                >
                    ثبت پیشرفت (Check-in)
                </button>
            </div>
            
            <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-brand-text mb-4">برنامه</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Board section */}
                    <div className="relative group">
                        <button 
                            ref={boardButtonRef}
                            onClick={() => {
                                if (linkedBoard) {
                                    handleBoardClick(linkedBoard.id);
                                } else {
                                    setIsBoardSelectorOpen(true);
                                }
                            }} 
                            className={`flex items-center w-full p-4 rounded-lg transition-colors ${
                                linkedBoard 
                                ? 'bg-gray-100/70 text-gray-800 hover:bg-gray-200/70'
                                : 'bg-gray-100/50 border-2 border-dashed hover:border-blue-400 text-gray-500 hover:text-blue-500'
                            }`}
                        >
                            {linkedBoard ? (
                                <>
                                    <ViewColumnsIcon className="w-5 h-5 ml-2" />
                                    <span className="text-sm font-medium truncate">{linkedBoard.name}</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-5 h-5 ml-2" />
                                    <span className="text-sm font-medium">افزودن برد</span>
                                </>
                            )}
                        </button>
                        {linkedBoard && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onUpdateKeyResultDetails(objectiveId, kr.id, { linkedBoardId: undefined }); }} 
                                className="absolute top-1/2 -translate-y-1/2 left-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="حذف برد"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                        {isBoardSelectorOpen && (
                            <div ref={boardPopoverRef} className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border z-10 max-h-48 overflow-y-auto">
                                {availableBoards.length > 0 ? availableBoards.map(board => (
                                    <button key={board.id} onClick={() => { onUpdateKeyResultDetails(objectiveId, kr.id, { linkedBoardId: board.id }); setIsBoardSelectorOpen(false); }} className="w-full text-right p-2 text-sm hover:bg-gray-100">{board.name}</button>
                                )) : <p className="p-2 text-xs text-center text-gray-500">هیچ برد مرتبطی در پروژه این هدف یافت نشد.</p>}
                            </div>
                        )}
                    </div>

                    {/* Document section */}
                    <div className="relative group">
                        <button 
                            ref={docButtonRef}
                            onClick={() => {
                                if (linkedDocuments.length === 1) {
                                    onOpenDocument(linkedDocuments[0].id, { readOnly: true });
                                } else {
                                    setIsDocSelectorOpen(true);
                                }
                            }} 
                            className={`flex items-center w-full p-4 rounded-lg transition-colors ${
                                linkedDocuments.length > 0
                                ? 'bg-gray-100/70 text-gray-800 hover:bg-gray-200/70'
                                : 'bg-gray-100/50 border-2 border-dashed hover:border-blue-400 text-