import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Objective, User, KeyResult, ObjectiveSettings } from '../types';
import ObjectiveRow from './ObjectiveRow';
import KeyResultRow from './KeyResultRow';
import { OBJECTIVE_CATEGORIES, OBJECTIVE_COLOR_MAP } from '../constants';
import HierarchicalView from './HierarchicalView';
import { SparklesIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, RocketIcon, DocumentArrowUpIcon } from './Icons';
import ObjectiveCreateMenu from './ObjectiveCreateMenu';
import ProgramView from './ProgramView';
import ExportFormatModal from './ExportFormatModal';

declare var html2canvas: any;


interface DashboardPageProps {
  objectives: Objective[];
  users: User[];
  onSelectObjective: (objective: Objective) => void;
  onAddNewObjective: () => void;
  onAddKeyResult: (objectiveId: string) => void;
  onSelectKeyResult: (objectiveId: string, krId: string) => void;
  onOpenAddKrModal: () => void;
  onEditObjective: (objective: Objective) => void;
  onDeleteObjective: (objectiveId: string) => void;
  onDeleteKeyResult: (objectiveId: string, keyResultId: string) => void;
  onUpdateKeyResultDetails: (objectiveId: string, krId: string, updates: Partial<KeyResult>) => void;
  objectiveSettings: ObjectiveSettings;
  onArchiveObjective: (objectiveId: string) => void;
  onArchiveKeyResult: (objectiveId: string, krId: string) => void;
  onStartSmartWizard: () => void;
  onEditKeyResult: (objectiveId: string, krId: string) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ 
    objectives, 
    users, 
    onSelectObjective,
    onAddNewObjective,
    onSelectKeyResult,
    onOpenAddKrModal,
    onEditObjective,
    onDeleteObjective,
    onDeleteKeyResult,
    onUpdateKeyResultDetails,
    objectiveSettings,
    onArchiveObjective,
    onArchiveKeyResult,
    onStartSmartWizard,
    onEditKeyResult,
}) => {
    const [expandedObjectiveId, setExpandedObjectiveId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'hierarchy' | 'program'>('list');
    const [listViewMode, setListViewMode] = useState<'objectives' | 'keyResults'>('objectives');
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const createButtonRef = useRef<HTMLButtonElement>(null);
    const programViewRef = useRef<HTMLDivElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    const getInitialYear = useCallback(() => {
        if (objectives.length > 0) {
            for (const obj of objectives) {
                if (obj.quarter) {
                    const year = parseInt(obj.quarter.split('-')[0], 10);
                    if (!isNaN(year)) return year;
                }
            }
        }
        return parseInt(new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/')[0]);
    }, [objectives]);

    const [displayYear, setDisplayYear] = useState(getInitialYear);
    
    useEffect(() => {
        const event = new CustomEvent('dashboardTabChange', { detail: { activeTab } });
        window.dispatchEvent(event);
    }, [activeTab]);

    const calculateCurrentQuarter = (): string => {
        const now = new Date();
        const year = parseInt(now.toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric' }));
        const month = now.getMonth(); // 0-11
        let quarter: string;
        if (month >= 2 && month <= 4) {
            quarter = 'Q1';
        } 
        else if (month >= 5 && month <= 7) {
            quarter = 'Q2';
        }
        else if (month >= 8 && month <= 10) {
            quarter = 'Q3';
        }
        else {
            quarter = 'Q4';
        }
        return `${year}-${quarter}`;
    };

    const [currentQuarterFilter, setCurrentQuarterFilter] = useState<string | 'all'>(calculateCurrentQuarter);


    const quarterOptions = useMemo(() => {
        const options = new Set<string>();
        objectives.forEach(obj => {
            if (obj.quarter) options.add(obj.quarter);
        });
        return Array.from(options).sort((a, b) => b.localeCompare(a));
    }, [objectives]);
    
    const formatQuarterLabel = useCallback((q: string) => {
        const [year, quarter] = q.split('-');
        const seasonMap: { [key: string]: string } = { 'Q1': 'بهار', 'Q2': 'تابستان', 'Q3': 'پاییز', 'Q4': 'زمستان' };
        return `${seasonMap[quarter] || ''} ${year}`;
    }, []);
    
    const allFilterOptions = useMemo(() => ['all', ...quarterOptions], [quarterOptions]);
    const currentFilterIndex = allFilterOptions.indexOf(currentQuarterFilter);

    const handlePrevSeason = () => {
        const newIndex = Math.min(allFilterOptions.length - 1, currentFilterIndex + 1);
        setCurrentQuarterFilter(allFilterOptions[newIndex]);
    };

    const handleNextSeason = () => {
        const newIndex = Math.max(0, currentFilterIndex - 1);
        setCurrentQuarterFilter(allFilterOptions[newIndex]);
    };
    
    const formattedSeasonLabel = useMemo(() => {
        if (currentQuarterFilter === 'all') return 'همه فصل‌ها';
        return formatQuarterLabel(currentQuarterFilter);
    }, [currentQuarterFilter, formatQuarterLabel]);

    const handleExport = useCallback(async () => {
        if (activeTab !== 'program' || !programViewRef.current) return;
        
        const element = programViewRef.current;
        try {
            const canvas = await html2canvas(element, { 
                scale: 2,
                useCORS: true,
                backgroundColor: '#fafafa'
            });
            const data = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            
            link.href = data;
            link.download = `tickup-program-${displayYear}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting program view as PNG:', error);
            alert('خطا در ایجاد تصویر خروجی.');
        }
        setIsExportModalOpen(false);
    }, [activeTab, displayYear]);

    const handleExportPdf = useCallback(async () => {
        if (activeTab !== 'program' || !programViewRef.current) return;
    
        const { jsPDF } = window.jspdf;
        const element = programViewRef.current;
    
        try {
            const fullCanvas = await html2canvas(element, { 
                scale: 2,
                useCORS: true, 
                backgroundColor: '#fafafa' 
            });
    
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: 'a4'
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = fullCanvas.width;
            const canvasHeight = fullCanvas.height;
    
            const ratio = pdfWidth / canvasWidth;
            const totalPdfHeight = canvasHeight * ratio;
    
            let yPositionOnPdf = 0;
            let pageCount = 0;
    
            while (yPositionOnPdf < totalPdfHeight) {
                if (pageCount > 0) {
                    pdf.addPage();
                }
    
                const sourceY = (yPositionOnPdf / totalPdfHeight) * canvasHeight;
                let sourceHeight = (pdfHeight / totalPdfHeight) * canvasHeight;
    
                if (sourceY + sourceHeight > canvasHeight) {
                    sourceHeight = canvasHeight - sourceY;
                }
    
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvasWidth;
                pageCanvas.height = sourceHeight; 
    
                const pageCtx = pageCanvas.getContext('2d');
                if (pageCtx) {
                    pageCtx.drawImage(
                        fullCanvas,
                        0, 
                        sourceY, 
                        canvasWidth, 
                        sourceHeight, 
                        0, 
                        0, 
                        canvasWidth, 
                        sourceHeight
                    );
                    
                    const imgHeightOnPdf = sourceHeight * ratio;
                    pdf.addImage(pageCanvas, 'PNG', 0, 0, pdfWidth, imgHeightOnPdf);
                }
                
                yPositionOnPdf += pdfHeight;
                pageCount++;
            }
    
            pdf.save(`tickup-program-${displayYear}.pdf`);
        } catch (error) {
            console.error('Error exporting program view as PDF:', error);
            alert('خطا در ایجاد فایل PDF.');
        }
        setIsExportModalOpen(false);
    }, [activeTab, displayYear]);

    useEffect(() => {
        const triggerExport = () => setIsExportModalOpen(true);
        window.addEventListener('exportProgramView', triggerExport);
        return () => {
            window.removeEventListener('exportProgramView', triggerExport);
        };
    }, []);

    const allVisibleObjectives = useMemo(() => objectives.filter(o => !o.isArchived), [objectives]);

    const visibleObjectives = useMemo(() => {
        if (currentQuarterFilter === 'all') return allVisibleObjectives;
        return allVisibleObjectives.filter(o => o.quarter === currentQuarterFilter);
    }, [allVisibleObjectives, currentQuarterFilter]);

    const seasonColors: { [key: string]: string } = {
        'Q1': 'rgba(238, 232, 255, 0.8)', // Spring
        'Q2': 'rgba(224, 247, 235, 0.8)', // Summer
        'Q3': 'rgba(255, 243, 232, 0.8)', // Autumn
        'Q4': 'rgba(227, 242, 253, 0.8)', // Winter
    };

    const activeSeasonColor = useMemo(() => {
        if (currentQuarterFilter === 'all') return null;
        const quarter = currentQuarterFilter.split('-')[1];
        return seasonColors[quarter] || null;
    }, [currentQuarterFilter]);

    const toggleExpand = (objectiveId: string) => {
        setExpandedObjectiveId(prev => (prev === objectiveId ? null : objectiveId));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
                     <button
                        onClick={() => setActiveTab('list')}
                        onDoubleClick={() => setListViewMode(prev => prev === 'objectives' ? 'keyResults' : 'objectives')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'list' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                        title="برای جابجایی بین نمای اهداف و نتایج کلیدی، دوبار کلیک کنید"
                    >
                        {activeTab === 'list' && listViewMode === 'keyResults' ? 'نمای نتایج کلیدی' : 'نمای لیست'}
                    </button>
                    <button
                        onClick={() => setActiveTab('hierarchy')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'hierarchy' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                        نمای سلسله مراتبی
                    </button>
                     <button
                        onClick={() => setActiveTab('program')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'program' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                    >
                        برنامه
                    </button>
                </nav>

                 <div className="flex items-center space-x-4 space-x-reverse">
                    {activeTab !== 'program' && (
                        <div className="relative group flex items-center space-x-1 space-x-reverse">
                            <button
                                onClick={handleNextSeason}
                                disabled={currentFilterIndex <= 0}
                                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-0 transition-opacity"
                                title="فصل جدیدتر"
                            >
                                <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-slate-400"/>
                            </button>
                            <span className="font-semibold text-gray-700 dark:text-slate-300 w-28 text-center">{formattedSeasonLabel}</span>
                            <button
                                onClick={handlePrevSeason}
                                disabled={currentFilterIndex >= allFilterOptions.length - 1}
                                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-0 transition-opacity"
                                title="فصل قدیمی‌تر"
                            >
                                <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-slate-400"/>
                            </button>
                        </div>
                    )}
                    
                     <div className="relative flex items-center space-x-2 space-x-reverse">
                        <button
                            ref={createButtonRef} onClick={() => setIsCreateMenuOpen(true)}
                            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold shadow-sm hover:bg-gray-50 flex items-center text-sm"
                        >
                            ایجاد <ChevronDownIcon className="w-4 h-4 mr-1"/>
                        </button>
                        <ObjectiveCreateMenu
                            isOpen={isCreateMenuOpen}
                            onClose={() => setIsCreateMenuOpen(false)}
                            anchorEl={createButtonRef.current}
                            onSelectObjective={onAddNewObjective}
                            onSelectKeyResult={onOpenAddKrModal}
                            onSelectSmartObjective={onStartSmartWizard}
                        />
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                {(activeTab === 'list' && activeSeasonColor) && (
                    <div className="h-1.5 rounded-t-lg mb-1" style={{ backgroundColor: activeSeasonColor }}></div>
                )}
                {activeTab === 'program' && (
                    <div ref={programViewRef}>
                        <ProgramView 
                            objectives={allVisibleObjectives} 
                            onSelectKeyResult={onSelectKeyResult}
                            displayYear={displayYear}
                            onYearChange={setDisplayYear}
                        />
                    </div>
                )}
                {activeTab === 'list' ? (
                    listViewMode === 'objectives' ? (
                        <div className="bg-white dark:bg-slate-800 rounded-b-lg border-x border-b border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
                            {/* Table Header */}
                            <div className="hidden md:flex items-center text-xs text-gray-500 dark:text-slate-400 font-semibold border-b dark:border-slate-700 bg-gray-50/70 dark:bg-slate-800/50 px-2">
                                <div className="w-10 pl-2 flex-shrink-0"></div>
                                <div className="flex-1 py-2 pr-2">عنوان هدف</div>
                                <div className="w-48 px-4 py-2 flex-shrink-0">وضعیت و پیشرفت</div>
                                <div className="w-32 px-4 py-2 flex-shrink-0">مالک</div>
                                <div className="w-28 px-2 py-2 flex-shrink-0"></div> {/* For action buttons column */}
                            </div>
                            
                            {visibleObjectives.map(obj => (
                                <div key={obj.id}>
                                    <ObjectiveRow
                                        objective={obj}
                                        owner={users.find(u => u.id === obj.ownerId)}
                                        isExpanded={expandedObjectiveId === obj.id}
                                        onToggleExpand={() => toggleExpand(obj.id)}
                                        onSelectObjective={() => onSelectObjective(obj)}
                                        onEditObjective={() => onEditObjective(obj)}
                                        onDeleteObjective={() => onDeleteObjective(obj.id)}
                                        onArchiveObjective={() => onArchiveObjective(obj.id)}
                                        categories={OBJECTIVE_CATEGORIES}
                                    />
                                    {expandedObjectiveId === obj.id && (
                                        <div className="pl-10 pr-5 bg-gray-50/50 dark:bg-slate-800/50">
                                            {obj.keyResults.filter(kr => !kr.isArchived).map(kr => (
                                                <KeyResultRow
                                                    key={kr.id}
                                                    kr={kr}
                                                    owner={users.find(u => u.id === kr.ownerId)}
                                                    onSelect={() => onSelectKeyResult(obj.id, kr.id)}
                                                    onUpdateKR={(updates) => onUpdateKeyResultDetails(obj.id, kr.id, updates)}
                                                    onDelete={() => onDeleteKeyResult(obj.id, kr.id)}
                                                    onEdit={() => onEditKeyResult(obj.id, kr.id)}
                                                    onArchive={() => onArchiveKeyResult(obj.id, kr.id)}
                                                    isCompact
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visibleObjectives.map((obj, index) => {
                                const visibleKRs = obj.keyResults.filter(kr => !kr.isArchived);
                                if (visibleKRs.length === 0) return null;

                                const colorClass = OBJECTIVE_COLOR_MAP[obj.color || 'gray']?.bg || 'bg-gray-400';
                                return (
                                    <div key={obj.id} className="relative pr-3">
                                        <div className={`absolute top-0 right-0 bottom-0 w-1 rounded-full ${colorClass}`}></div>
                                        <div className="space-y-2">
                                            {visibleKRs.map(kr => (
                                                <KeyResultRow
                                                    key={kr.id}
                                                    kr={kr}
                                                    owner={users.find(u => u.id === kr.ownerId)}
                                                    onSelect={() => onSelectKeyResult(obj.id, kr.id)}
                                                    onUpdateKR={(updates) => onUpdateKeyResultDetails(obj.id, kr.id, updates)}
                                                    onDelete={() => onDeleteKeyResult(obj.id, kr.id)}
                                                    onEdit={() => onEditKeyResult(obj.id, kr.id)}
                                                    onArchive={() => onArchiveKeyResult(obj.id, kr.id)}
                                                    objectiveTitle={obj.title}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : null}
                {activeTab === 'hierarchy' && (
                     <HierarchicalView
                        objectives={visibleObjectives}
                        users={users}
                        onSelectObjective={onSelectObjective}
                        hierarchicalViewStyle={objectiveSettings.hierarchicalViewStyle}
                        onEditObjective={onEditObjective}
                        onArchiveObjective={onArchiveObjective}
                        onDeleteObjective={onDeleteObjective}
                    />
                )}
            </div>
            <ExportFormatModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExportPNG={handleExport}
                onExportPDF={handleExportPdf}
            />
        </div>
    );
};

export default DashboardPage;