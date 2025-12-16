import { Objective, KeyResult, KRCategory } from '../types';

export const calculateKrProgress = (kr: KeyResult): number => {
    if (kr.isArchived) return 0;
    switch (kr.category) {
        case KRCategory.Standard:
        case KRCategory.Stretch: {
            const { startValue = 0, targetValue = 1, currentValue = 0, targetDirection = 'INCREASING' } = kr;
            if (targetValue === startValue) {
                return currentValue >= targetValue ? 100 : 0;
            }
            
            let progress = 0;

            if (targetDirection === 'DECREASING') {
                const totalDistance = startValue - targetValue;
                const distanceCovered = startValue - currentValue;
                if (totalDistance <= 0) {
                    return currentValue <= targetValue ? 100 : 0;
                }
                progress = (distanceCovered / totalDistance) * 100;
            } else { // INCREASING
                const totalDistance = targetValue - startValue;
                const distanceCovered = currentValue - startValue;
                if (totalDistance <= 0) {
                    return currentValue >= targetValue ? 100 : 0;
                }
                progress = (distanceCovered / totalDistance) * 100;
            }

            return Math.max(0, Math.min(100, progress));
        }
        case KRCategory.Binary:
            return kr.currentValue === 1 ? 100 : 0;
        default:
            return 0;
    }
};

export const calculateObjectiveProgress = (objective: Objective): number => {
    const visibleKRs = objective.keyResults.filter(kr => !kr.isArchived);
    if (!visibleKRs || visibleKRs.length === 0) return 0;
    
    const totalProgress = visibleKRs.reduce((acc, kr) => {
        return acc + calculateKrProgress(kr);
    }, 0);
    
    return totalProgress / visibleKRs.length;
};
