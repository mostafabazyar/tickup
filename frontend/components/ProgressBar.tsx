import React from 'react';
import { DiamondIcon } from './Icons';

interface ProgressBarProps {
  progress: number;
  colorClass?: string;
  showPercentage?: boolean;
  heightClass?: string;
  showEndPin?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = 'bg-teal-500', showPercentage = false, heightClass = 'h-2', showEndPin = false }) => {
  const cappedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="relative w-full">
      <div className="pl-4">
        <div className={`relative w-full bg-gray-200 dark:bg-slate-700 rounded-full ${heightClass} overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
            style={{ width: `${cappedProgress}%` }}
          />
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-white">
                {`${cappedProgress.toFixed(0)}%`}
              </span>
            </div>
          )}
        </div>
      </div>
      {showEndPin && (
        <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-none">
             <DiamondIcon className="w-8 h-8 drop-shadow-md"/>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;