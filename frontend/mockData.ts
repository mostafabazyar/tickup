import {
  User,
  Objective,
  CompanyVision,
  KRType,
  KRCategory,
  KeyResult,
  CheckIn,
} from './types';

const today = new Date();
const todayISO = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString();

const getDateWithOffset = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
};

// Helper to generate realistic check-ins for demo data
const generateCheckins = (kr: KeyResult, numPeriods: number): { checkIns: CheckIn[], finalValue: number } => {
    const checkIns: CheckIn[] = [];
    if (!kr.startDate) return { checkIns, finalValue: kr.startValue || 0 };

    let currentValue = kr.startValue || 0;
    const targets = kr.reportFrequency === 'DAILY'
        ? Array(numPeriods).fill(kr.dailyTarget?.target || 0)
        : kr.weeklyTargets || [];

    for (let i = 0; i < Math.min(numPeriods, targets.length); i++) {
        const targetForPeriod = targets[i];
        if (targetForPeriod === undefined) continue;

        const date = new Date(kr.startDate);
        if (kr.reportFrequency === 'DAILY') {
            date.setUTCDate(date.getUTCDate() + i);
        } else { // WEEKLY
            date.setUTCDate(date.getUTCDate() + i * 7);
        }

        if (date > new Date()) break; // Don't generate for future dates

        const random = Math.random();
        let progressForPeriod;

        if (random < 0.05) { // 5% below
            progressForPeriod = targetForPeriod * (Math.random() * 0.4 + 0.3); // 30% to 70% of target
        } else if (random < 0.20) { // 15% exceeded
            progressForPeriod = targetForPeriod * (1 + (Math.random() * 0.4 + 0.1)); // 110% to 150% of target
        } else { // 80% met
            progressForPeriod = targetForPeriod;
        }

        currentValue += progressForPeriod;

        checkIns.push({
            id: `ci-${kr.id}-${i}`,
            date: date.toISOString(),
            value: currentValue,
            rating: 4,
            report: `Check-in for period ${i+1}`,
            challengeDifficulty: 2,
        });
    }

    return { checkIns, finalValue: currentValue };
};

export const MOCK_USERS: User[] = [
  { 
    id: 'u-admin', 
    name: 'مدیر سیستم', 
    username: 'admin', 
    password: 'admin', 
    role: 'admin', 
    avatarUrl: 'https://i.pravatar.cc/150?u=admin'
  },
  { id: 'u-rezaei', name: 'دکتر رضایی', username: 'rezaei', password: 'password', role: 'lead', avatarUrl: 'https://i.pravatar.cc/150?u=rezaei' },
  { id: 'u-akbari', name: 'مهندس اکبری', username: 'akbari', password: 'password', role: 'lead', avatarUrl: 'https://i.pravatar.cc/150?u=akbari' },
  { id: 'u-hosseini', name: 'خانم حسینی', username: 'hosseini', password: 'password', role: 'member', avatarUrl: 'https://i.pravatar.cc/150?u=hosseini' },
  { id: 'u-salehi', name: 'آقای صالحی', username: 'salehi', password: 'password', role: 'member', avatarUrl: 'https://i.pravatar.cc/150?u=salehi' },
];

const krQuality1Base: KeyResult = { id: 'kr-q1', title: 'کاهش نرخ ناخالصی در پودر دیالیز از 0.5% به 0.1%', ownerId: 'u-hosseini', category: KRCategory.Standard, type: KRType.Percentage, startValue: 0.5, targetValue: 0.1, currentValue: 0, checkIns: [], startDate: getDateWithOffset(-8 * 7), status: 'ON_TRACK', reportFrequency: 'WEEKLY', weeklyTargets: [0.08, 0.08, 0.07, 0.07, 0.05, 0.05, 0.05, 0.05] };
const krQuality1Checkins = generateCheckins(krQuality1Base, 8);
krQuality1Base.checkIns = krQuality1Checkins.checkIns;
krQuality1Base.currentValue = krQuality1Checkins.finalValue;

const krQuality2Base: KeyResult = { id: 'kr-q2', title: 'افزایش تولید روزانه از 500 کیلوگرم به 700 کیلوگرم', ownerId: 'u-akbari', category: KRCategory.Standard, type: KRType.Number, startValue: 500, targetValue: 700, currentValue: 0, dailyTarget: { type: KRType.Number, target: 7, current: 0 }, checkIns: [], status: 'NEEDS_ATTENTION', reportFrequency: 'DAILY', startDate: getDateWithOffset(-30) };
const krQuality2Checkins = generateCheckins(krQuality2Base, 30);
krQuality2Base.checkIns = krQuality2Checkins.checkIns;
krQuality2Base.currentValue = krQuality2Checkins.finalValue;
if (krQuality2Base.dailyTarget) krQuality2Base.dailyTarget.current = krQuality2Checkins.checkIns.slice(-1)[0]?.value - (krQuality2Checkins.checkIns.slice(-2)[0]?.value || krQuality2Base.startValue || 0);

export const MOCK_OBJECTIVES: Objective[] = [
    {
        id: 'obj-quality-1',
        title: 'افزایش کیفیت و بهینه‌سازی تولید پودر دیالیز',
        description: 'رسیدن به بالاترین استانداردهای کیفی در تولید پودر دیالیز و افزایش ظرفیت تولید برای پاسخ به تقاضای بازار.',
        ownerId: 'u-akbari',
        category: 'QUALITY_STANDARDS',
        color: 'blue',
        isArchived: false,
        keyResults: [ krQuality1Base, krQuality2Base ]
    },
    {
        id: 'obj-rd-1',
        title: 'توسعه و عرضه نسل جدید محفظه‌های دیالیز زیست‌سازگار',
        description: 'تحقیق، توسعه و آماده‌سازی برای تولید انبوه محفظه‌های دیالیز با مواد بیوپلیمر برای کاهش واکنش‌های آلرژیک.',
        ownerId: 'u-rezaei',
        category: 'PRODUCT_INNOVATION',
        color: 'green',
        isArchived: false,
        keyResults: [
            { id: 'kr-rd1', title: 'تکمیل فاز اول تحقیق و توسعه تا پایان فصل', ownerId: 'u-rezaei', category: KRCategory.Binary, currentValue: 0, binaryLabels: { incomplete: 'در جریان', complete: 'تکمیل شد' }, checkIns: [], status: 'OFF_TRACK' },
            { id: 'kr-rd2', title: 'دریافت گواهی‌نامه استاندارد پزشکی ISO 13485', ownerId: 'u-hosseini', category: KRCategory.Binary, currentValue: 0, checkIns: [], binaryLabels: { incomplete: 'در حال پیگیری', complete: 'دریافت شد' }, status: 'CHALLENGE' },
            { id: 'kr-rd3', title: 'افزایش هفتگی نمونه‌های موفق آزمایشگاهی', ownerId: 'u-rezaei', category: KRCategory.Standard, type: KRType.Number, startValue: 0, targetValue: 50, currentValue: 15, checkIns: [], status: 'ON_TRACK', reportFrequency: 'WEEKLY', weeklyTargets: [5, 5, 8, 8, 12, 12], startDate: getDateWithOffset(-42) },
        ]
    }
];

export const MOCK_COMPANY_VISION: CompanyVision = {
    missionTitle: 'بهبود کیفیت زندگی بیماران دیالیزی از طریق تولید تجهیزات پزشکی نوآورانه و با کیفیت جهانی',
    passion: 'کمک به بیماران و نوآوری در حوزه سلامت',
    skill: 'مهندسی پزشکی، تولید در اتاق تمیز، کنترل کیفیت',
    market: 'بیمارستان‌ها و مراکز دیالیز در سراسر کشور',
    business: 'تولید و فروش تجهیزات مصرفی دیالیز'
};
