import React, { useState, useMemo } from 'react';
import { Objective } from '../types';
import { SproutIcon, SunIcon, LeafIcon, SnowflakeIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from './Icons';

interface SeasonalCardProps {
    title: string;
    objectives: Objective[];
    color: string;
    Icon: React.FC<any>;
    onSelectKeyResult: (objectiveId: string, krId: string) => void;
}

const SeasonalCard: React.FC<SeasonalCardProps> = ({ title, objectives, color, Icon, onSelectKeyResult }) => {
    const [expandedObjectiveIds, setExpandedObjectiveIds] = useState<Set<string>>(new Set());

    const toggleObjective = (objectiveId: string) => {
        setExpandedObjectiveIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(objectiveId)) {
                newSet.delete(objectiveId);
            } else {
                newSet.add(objectiveId);
            }
            return newSet;
        });
    };

    return (
        <div className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ease-in-out" style={{ backgroundColor: color }}>
            <Icon className="absolute -left-4 top-1/2 -translate-y-1/2 w-32 h-32 text-black opacity-5 pointer-events-none" />
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
                <div className="space-y-3">
                    {objectives.length > 0 ? (
                        objectives.map(obj => {
                            const isExpanded = expandedObjectiveIds.has(obj.id);
                            return (
                                <div key={obj.id} className="p-3 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm border border-white/60">
                                    <button
                                        onClick={() => toggleObjective(obj.id)}
                                        className="w-full text-right font-semibold text-gray-800 hover:text-black transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <span className="text-lg mr-2">🎯</span>
                                            <span>{obj.title}</span>
                                        </div>
                                        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="pr-8 mt-2 space-y-1.5 animate-fade-in">
                                            {obj.keyResults.filter(kr => !kr.isArchived).map((kr, index, arr) => (
                                                <button
                                                    key={kr.id}
                                                    onClick={() => onSelectKeyResult(obj.id, kr.id)}
                                                    className="text-gray-700 text-sm flex items-start w-full text-right hover:bg-white/50 p-1 rounded-md"
                                                >
                                                    <span className="mr-2 font-mono text-gray-400">{index === arr.length - 1 ? '└──' : '├──'}</span>
                                                    <span className="flex-grow">{kr.title}</span>
                                                </button>
                                            ))}
                                            {obj.keyResults.filter(kr => !kr.isArchived).length === 0 && (
                                                <div className="text-gray-700 text-sm flex items-start">
                                                     <span className="mr-2 font-mono text-gray-400">└──</span>
                                                     <p className="text-xs text-gray-500 italic">نتیجه کلیدی برای این هدف وجود ندارد.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-gray-500 text-sm italic p-2">
                            هدفی برای این فصل تعریف نشده.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


interface ProgramViewProps {
  objectives: Objective[];
  onSelectKeyResult: (objectiveId: string, krId: string) => void;
  displayYear: number;
  onYearChange: (year: number) => void;
}

const ProgramView: React.FC<ProgramViewProps> = ({ objectives, onSelectKeyResult, displayYear, onYearChange }) => {
    const [annualGoal, setAnnualGoal] = useState('');

    const handlePrevYear = () => onYearChange(displayYear - 1);
    const handleNextYear = () => onYearChange(displayYear + 1);

    const objectivesByQuarter = useMemo(() => {
        const grouped: { [quarter: string]: Objective[] } = {};
        objectives.forEach(obj => {
            if (obj.quarter) {
                if (!grouped[obj.quarter]) {
                    grouped[obj.quarter] = [];
                }
                grouped[obj.quarter].push(obj);
            }
        });
        return grouped;
    }, [objectives]);

    const seasons = [
        { name: 'بهار', quarter: 'Q1', color: 'rgba(238, 232, 255, 0.6)', Icon: SproutIcon },
        { name: 'تابستان', quarter: 'Q2', color: 'rgba(224, 247, 235, 0.6)', Icon: SunIcon },
        { name: 'پاییز', quarter: 'Q3', color: 'rgba(255, 243, 232, 0.6)', Icon: LeafIcon },
        { name: 'زمستان', quarter: 'Q4', color: 'rgba(227, 242, 253, 0.6)', Icon: SnowflakeIcon }
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in">
            <div className="mb-8 relative">
                <input
                    type="text"
                    value={annualGoal}
                    onChange={e => setAnnualGoal(e.target.value)}
                    placeholder="هدف سال:"
                    className="w-full bg-white border border-gray-300 rounded-lg p-4 text-xl font-semibold text-right placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                 <div className="absolute top-1/2 -translate-y-1/2 left-4 flex items-center space-x-2 space-x-reverse">
                    <button onClick={handlePrevYear} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="font-bold text-lg text-gray-700 w-12 text-center">{displayYear}</span>
                    <button onClick={handleNextYear} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                 {seasons.map(season => {
                    const quarterKey = `${displayYear}-${season.quarter}`;
                    const seasonObjectives = objectivesByQuarter[quarterKey] || [];
                    return (
                        <SeasonalCard
                            key={quarterKey}
                            title={`${season.name} ${displayYear}`}
                            objectives={seasonObjectives}
                            color={season.color}
                            Icon={season.Icon}
                            onSelectKeyResult={onSelectKeyResult}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ProgramView;