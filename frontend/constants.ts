// This file can be used for application-wide constants.
import React from 'react';
import { ObjectiveCategoryId, KRType, ViewMode, TaskWorkflowState } from './types';
// FIX: Corrected ICONS import path by removing ICONS map to break circular dependency
import { ChartIcon, HandshakeIcon, LightbulbIcon, TrophyIcon, UserGroupIcon, BrainIcon, ClipboardListIcon, CubeIcon, GoalIcon, ChatBubbleOvalLeftEllipsisIcon, GraduationCapIcon, ICONS } from './components/Icons';

export const OBJECTIVE_COLOR_MAP: { [key: string]: { bg: string } } = {
  gray: { bg: 'bg-gray-400' },
  red: { bg: 'bg-red-500' },
  green: { bg: 'bg-green-500' },
  purple: { bg: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-400' },
  blue: { bg: 'bg-blue-500' },
  pink: { bg: 'bg-pink-500' },
  orange: { bg: 'bg-orange-500' },
};

export const OBJECTIVE_COLOR_OPTIONS = Object.keys(OBJECTIVE_COLOR_MAP);

export const OBJECTIVE_CATEGORIES: { [key in ObjectiveCategoryId]: { id: ObjectiveCategoryId; label: string; description: string; IconName: string; } } = {
  BUSINESS_GROWTH: { id: 'BUSINESS_GROWTH', label: 'رشد و توسعه کسب‌وکار', description: 'افزایش درآمد، سهم بازار، مشتریان جدید', IconName: 'ChartIcon' },
  CUSTOMER_MARKET: { id: 'CUSTOMER_MARKET', label: 'مشتری و بازار', description: 'افزایش رضایت مشتری، تعامل با کاربران', IconName: 'HandshakeIcon' },
  PRODUCT_INNOVATION: { id: 'PRODUCT_INNOVATION', label: 'محصول و نوآوری', description: 'بهبود کیفیت محصول، توسعه ویژگی‌های جدید', IconName: 'LightbulbIcon' },
  PROCESS_EFFICIENCY: { id: 'PROCESS_EFFICIENCY', label: 'فرآیندها و بهره‌وری', description: 'بهبود کارایی داخلی، کاهش هزینه‌ها', IconName: 'SettingsIcon' },
  HR_CULTURE: { id: 'HR_CULTURE', label: 'منابع انسانی و فرهنگ سازمانی', description: 'رشد تیم، آموزش کارکنان، انگیزه', IconName: 'UserGroupIcon' },
  FINANCE_PROFITABILITY: { id: 'FINANCE_PROFITABILITY', label: 'مالی و سودآوری', description: 'مدیریت هزینه‌ها، افزایش سود', IconName: 'BanknotesIcon' },
  SALES: { id: 'SALES', label: 'فروش', description: 'افزایش فروش، نرخ تبدیل و درآمدزایی مستقیم', IconName: 'TrophyIcon' },
  LEGAL_COMPLIANCE: { id: 'LEGAL_COMPLIANCE', label: 'حقوقی و انطباق', description: 'رعایت قوانین، مدیریت ریسک حقوقی و قراردادها', IconName: 'FlagIcon' },
  SUSTAINABILITY: { id: 'SUSTAINABILITY', label: 'پایداری و مسئولیت اجتماعی', description: 'کاهش اثرات زیست‌محیطی، مسئولیت اجتماعی', IconName: 'GlobeAltIcon' },
  QUALITY_STANDARDS: { id: 'QUALITY_STANDARDS', label: 'کیفیت و استانداردها', description: 'استانداردهای ایزو، بهبود کیفیت، کاهش خطاها', IconName: 'CheckCircleIcon' },
  TECH_DIGITALIZATION: { id: 'TECH_DIGITALIZATION', label: 'فناوری و دیجیتال‌سازی', description: 'پیاده‌سازی نرم‌افزار، امنیت اطلاعات', IconName: 'ComputerDesktopIcon' },
  COMMUNICATION_BRANDING: { id: 'COMMUNICATION_BRANDING', label: 'ارتباطات و برندینگ', description: 'افزایش آگاهی برند، تبلیغات', IconName: 'MegaphoneIcon' },
};

export const OBJECTIVE_CATEGORY_LIST = Object.values(OBJECTIVE_CATEGORIES);

export const UNIT_DEFINITIONS: {
  group: string;
  units: { value: string; label: string; type: KRType }[];
}[] = [
  {
    group: 'عمومی',
    units: [
      { value: 'number', label: 'عدد', type: KRType.Number },
      { value: 'percentage', label: 'درصد', type: KRType.Percentage },
    ],
  },
  {
    group: 'مالی',
    units: [
      { value: 'toman', label: 'تومان', type: KRType.Currency },
      { value: 'rial', label: 'ریال', type: KRType.Currency },
      { value: 'dollar', label: 'دلار', type: KRType.Currency },
      { value: 'euro', label: 'یورو', type: KRType.Currency },
    ],
  },
  {
    group: 'شمارشی',
    units: [
      { value: 'user', label: 'کاربر', type: KRType.Number },
      { value: 'visit', label: 'بازدید', type: KRType.Number },
      { value: 'click', label: 'کلیک', type: KRType.Number },
      { value: 'error_count', label: 'تعداد خطا', type: KRType.Number },
    ],
  },
  {
    group: 'زمان',
    units: [
        { value: 'hour', label: 'ساعت', type: KRType.Number },
        { value: 'minute', label: 'دقیقه', type: KRType.Number },
        { value: 'second', label: 'ثانیه', type: KRType.Number },
    ]
  },
  {
    group: 'اندازه‌گیری',
    units: [
      { value: 'meter', label: 'متر', type: KRType.Number },
      { value: 'cubic_meter', label: 'متر مکعب', type: KRType.Number },
      { value: 'kg', label: 'کیلوگرم', type: KRType.Number },
      { value: 'g', label: 'گرم', type: KRType.Number },
      { value: 'temp', label: 'دما', type: KRType.Number },
      { value: 'liter', label: 'لیتر', type: KRType.Number },
    ],
  },
];

// FIX: Added missing constants
export const KANBAN_COLOR_OPTIONS = ['gray', 'red', 'yellow', 'green', 'blue', 'purple', 'pink', 'orange'];
export const KANBAN_COLOR_MAP: { [key: string]: { bg: string; text: string; dot: string; hover: string } } = {
  gray: { bg: 'bg-gray-100 dark:bg-slate-800', text: 'text-gray-800 dark:text-slate-200', dot: 'bg-gray-400', hover: 'hover:bg-gray-200' },
  red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-500', hover: 'hover:bg-red-200/60' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-200', dot: 'bg-yellow-500', hover: 'hover:bg-yellow-200/60' },
  green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500', hover: 'hover:bg-green-200/60' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-200', dot: 'bg-blue-500', hover: 'hover:bg-blue-200/60' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-800 dark:text-purple-200', dot: 'bg-purple-500', hover: 'hover:bg-purple-200/60' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200', dot: 'bg-pink-500', hover: 'hover:bg-pink-200/60' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-200', dot: 'bg-orange-500', hover: 'hover:bg-orange-200/60' },
};

export const VIEW_MODES: { key: ViewMode, label: string, Icon: React.FC<any> }[] = [
    { key: 'board', label: 'برد', Icon: ICONS.ViewColumnsIcon },
    { key: 'table', label: 'جدول', Icon: ICONS.TableCellsIcon },
    { key: 'calendar', label: 'تقویم', Icon: ICONS.CalendarIcon },
    { key: 'timeline', label: 'تایم لاین', Icon: ICONS.ClockIcon },
    { key: 'process', label: 'فرایند', Icon: ICONS.ProcessGearsIcon },
    { key: 'card', label: 'کارتی', Icon: ICONS.Squares2x2Icon },
];

export const FEEDBACK_CATEGORY_DETAILS: { [key: string]: { label: string; color: string; Icon: React.FC<any> } } = {
  SKILL: { label: 'مهارت', color: '#3b82f6', Icon: BrainIcon },
  PERFORMANCE: { label: 'عملکرد', color: '#10b981', Icon: ChartIcon },
  LEARNING: { label: 'یادگیری', color: '#8b5cf6', Icon: GraduationCapIcon },
  CHALLENGE_SOLVING: { label: 'حل چالش', color: '#f97316', Icon: LightbulbIcon },
  ENCOURAGEMENT: { label: 'تشویق', color: '#ef4444', Icon: TrophyIcon },
  COACHING: { label: 'کوچینگ', color: '#6366f1', Icon: ChatBubbleOvalLeftEllipsisIcon },
};

export const FEEDBACK_CATEGORY_KEYS = Object.keys(FEEDBACK_CATEGORY_DETAILS);

export const STICKER_COLOR_MAP: { [key: string]: { bg: string; text: string } } = {
    yellow: { bg: 'bg-yellow-200/80', text: 'text-yellow-900' },
    blue: { bg: 'bg-blue-200/80', text: 'text-blue-900' },
    green: { bg: 'bg-green-200/80', text: 'text-green-900' },
    pink: { bg: 'bg-pink-200/80', text: 'text-pink-900' },
    purple: { bg: 'bg-purple-200/80', text: 'text-purple-900' },
};
export const STRATEGY_CATEGORIES: any[] = [];
export const STRATEGY_STATUSES: any[] = [];
export const STRATEGY_STATUS_COLORS: any = {};

export const TAG_COLOR_MAP: { [key: string]: { bg: string; text: string } } = {
  gray: { bg: 'bg-gray-200', text: 'text-gray-800' },
  red: { bg: 'bg-red-200', text: 'text-red-800' },
  yellow: { bg: 'bg-yellow-200', text: 'text-yellow-800' },
  green: { bg: 'bg-green-200', text: 'text-green-800' },
  blue: { bg: 'bg-blue-200', text: 'text-blue-800' },
  purple: { bg: 'bg-purple-200', text: 'text-purple-800' },
  pink: { bg: 'bg-pink-200', text: 'text-pink-800' },
};
export const TAG_COLOR_OPTIONS = Object.keys(TAG_COLOR_MAP);
export const STATUS_TABLE_CELL_COLORS: any = {};

export const TABLE_BACKGROUND_COLOR_OPTIONS: string[] = [];
export const TABLE_COLOR_MAP: any = {};
// FIX: Added STATUS_TEXT_COLOR_MAP constant for use in EditableCell and TaskSidePanel
export const STATUS_TEXT_COLOR_MAP: { [key in TaskWorkflowState]: string } = {
  'برای انجام': 'text-gray-600 dark:text-slate-400',
  'در حال پیشرفت': 'text-orange-600 dark:text-orange-400',
  'انجام شد': 'text-green-600 dark:text-green-500',
};
export const TEXT_COLOR_MAP: any = {};
export const TEXT_COLOR_OPTIONS: string[] = [];

export const LEARNING_SKILLS: any[] = [];

export const STATUS_BADGE_COLOR_MAP: any = {};