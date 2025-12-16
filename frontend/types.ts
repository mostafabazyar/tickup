import React from 'react';

export interface User {
  id:string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  avatarUrl: string;
  signatureUrl?: string;
  teamId?: string;
  personality?: Personality;
}

// FIX: Added many missing types and enums
export type Role = 'admin' | 'lead' | 'member';

export enum KRType {
  Number = 'NUMBER',
  Percentage = 'PERCENTAGE',
  Currency = 'CURRENCY',
}

export enum KRCategory {
  Standard = 'STANDARD',
  Stretch = 'STRETCH',
  Binary = 'BINARY',
  Assignment = 'ASSIGNMENT',
}

export type KRStatus = 'ON_TRACK' | 'NEEDS_ATTENTION' | 'OFF_TRACK' | 'CHALLENGE';

export type ReportFrequency = 'DAILY' | 'WEEKLY';

export interface StretchLevel {
    label: string;
    value: number;
}

export interface Comment {
    id: string;
    authorId: string;
    text: string;
    createdAt: string; // ISO string
}

export interface CheckIn {
  id: string;
  date: string; // ISO string
  value: number;
  rating: number; // 1-5
  report: string | {
    tasksDone: string;
    tasksNext: string;
    challenges: string;
  };
  challengeDifficulty: number; // 1-5
  feedbackTagId?: string;
  feedbackComment?: string;
  feedbackRating?: number;
  feedbackGiverId?: string;
  challengeTagIds?: string[];
}

export interface DailyTarget {
    type: KRType;
    target: number;
    current: number;
    unit?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  ownerId: string;
  category: KRCategory;
  currentValue: number;
  checkIns: CheckIn[];
  isArchived?: boolean;
  comments?: Comment[];
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  reportFrequency?: ReportFrequency;
  status?: KRStatus;
  bannerImageUrl?: string;
  
  // For Standard type
  type?: KRType;
  unit?: string;
  targetDirection?: 'INCREASING' | 'DECREASING';
  startValue?: number;
  targetValue?: number;
  dailyTarget?: DailyTarget;
  weeklyTargets?: number[];

  // For Stretch type
  stretchLevels?: StretchLevel[];

  // For Binary type
  binaryLabels?: { incomplete: string; complete: string };

  // For Assignment type
  assignedTaskIds?: string[];
  assignedFormIds?: string[];
  linkedBoardId?: string;
  linkedDocumentIds?: string[];
}


export type ObjectiveCategoryId = 'BUSINESS_GROWTH' | 'CUSTOMER_MARKET' | 'PRODUCT_INNOVATION' | 'PROCESS_EFFICIENCY' | 'HR_CULTURE' | 'FINANCE_PROFITABILITY' | 'SALES' | 'LEGAL_COMPLIANCE' | 'SUSTAINABILITY' | 'QUALITY_STANDARDS' | 'TECH_DIGITALIZATION' | 'COMMUNICATION_BRANDING';

export interface Objective {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  keyResults: KeyResult[];
  category?: ObjectiveCategoryId;
  parentId?: string;
  isArchived?: boolean;
  color?: string;
  endDate?: string; // ISO string
  isDefault?: boolean;
  quarter?: string; // e.g., "1404-Q1"
  strategyId?: string;
  indexIds?: string[];
}

export interface SuggestedKR {
    title: string;
    type: KRType;
    startValue: number;
    targetValue: number;
}

export interface SuggestedObjectiveWithKRs {
    objectiveTitle: string;
    objectiveDescription: string;
    keyResults: SuggestedKR[];
}

export interface SuggestedPerspective {
    perspectiveTitle: string;
    perspectiveDescription: string;
    objectives: SuggestedObjectiveWithKRs[];
}

export interface CompanyValue {
  id: string;
  text: string;
  icon: string;
  color: string;
}

export interface CompanyVision {
    missionTitle: string;
    passion: string;
    skill: string;
    market: string;
    business: string;
    fiveYearVision?: string;
    values?: CompanyValue[];
}

export type HierarchicalViewStyle = 'MIND_MAP' | 'ORG_CHART' | 'CIRCULAR' | 'ADVANCED_ORG_CHART';

export interface ObjectiveSettings {
    hierarchicalViewStyle: HierarchicalViewStyle;
}

export type FormDisplayStyle = 'DEFAULT' | 'MINIMAL_CARD' | 'SPACIOUS_CARD' | 'VISUAL' | 'SPACIOUS';


export interface StyleSettings {
  fontFamily: string;
  fontSize: 'sm' | 'base' | 'lg';
  primaryColor: string;
  backgroundColor: string;
  formDisplayStyle?: FormDisplayStyle;
}

export interface ComponentStyles {
    popups: StyleSettings;
    strategyCards: StyleSettings;
}

export interface Team {
  id: string;
  name: string;
  leadId: string;
  memberIds: string[];
  icon: string;
  category: 'محصول' | 'فنی' | 'فروش' | 'بازاریابی' | 'عمومی';
}

export type TaskWorkflowState = 'برای انجام' | 'در حال پیشرفت' | 'انجام شد';
export const WORKFLOW_STATES: TaskWorkflowState[] = ['برای انجام', 'در حال پیشرفت', 'انجام شد'];

export interface Recurrence {
    frequency: 'hourly' | 'every-2-hours' | 'every-3-hours' | 'every-6-hours' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
}

export interface Tag {
    id: string;
    text: string;
    color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type CustomFieldType = 'TEXT_SHORT' | 'TEXT_LONG' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTI_SELECT' | 'CONFIRMATION' | 'USER' | 'COST' | 'PHONE' | 'DOCUMENT' | 'FORM';

export interface CustomField {
    definitionId: string;
    value: any;
}

export interface CustomFieldDefinition {
    id: string;
    label: string;
    type: CustomFieldType;
    options?: string[];
}

export type PrerequisiteType = 'TASK' | 'FORM' | 'KANBAN_LIST' | 'DOCUMENT_STUDY';

export interface Prerequisite {
    type: PrerequisiteType;
    taskIds?: string[];
    formIds?: string[];
    projectId?: string;
    columnId?: string;
    documentId?: string;
}

export interface TaskRequiredSkill {
    skillId: string;
    weight: number; // 1-10
}

export interface TaskResourceLink {
    resourceId: string;
    quantity: number;
}

export interface Task {
    id: string;
    content: string;
    description?: string;
    projectId: string;
    assigneeId: string;
    // FIX: Add missing assigneeTeamId property
    assigneeTeamId?: string;
    columnId: string;
    status: TaskWorkflowState;
    dueDate?: string; // ISO String
    startDate?: string; // ISO String
    isArchived?: boolean;
    tags?: Tag[];
    comments?: Comment[];
    checklist?: ChecklistItem[];
    recurrence?: Recurrence;
    numericValue?: number;
    dailyTargetKrId?: string;
    customFields?: CustomField[];
    prerequisites?: Prerequisite[];

    prerequisiteCompletion?: { [documentId: string]: boolean };
    requiredSkills?: TaskRequiredSkill[];
    workResources?: TaskResourceLink[];
    costResources?: TaskResourceLink[];
    materialResources?: TaskResourceLink[];
    icon?: string;
    color?: string;
    monitoring?: Partial<MonitoringData>;
    documentId?: string;
    // FIX: Add missing progress property
    progress?: number;
}

export interface KanbanColumn {
    id: string;
    title: string;
    boardId: string;
    color?: string;
    icon?: string;
    processDescription?: string;
    processStartDate?: string;
    processEndDate?: string;
    requiredSkills?: TaskRequiredSkill[];
}

export type ViewMode = 'board' | 'table' | 'calendar' | 'timeline' | 'process' | 'card';

export interface Board {
    id: string;
    name: string;
    projectId: string | 'all';
    defaultViewMode: ViewMode;
    enabledViews?: ViewMode[];
    isArchived?: boolean;
    isPinned?: boolean;
    color?: string;
    icon?: string;
    tableViewColumns?: string[];
    showRiskIndicators?: boolean;
    linkedKrIds?: string[];
}

export interface WorkResource {
    id: string;
    name: string;
    timePerDay: number; // hours
    hourlyRate: number; // Toman
}
export interface CostResource {
    id: string;
    name: string;
    amount: number; // Toman
}
export interface MaterialResource {
    id: string;
    name: string;
    cost: number; // Toman
}

export interface Resources {
    work: WorkResource[];
    cost: CostResource[];
    material: MaterialResource[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectRisk {
    id: string;
    description: string;
    likelihood: RiskLevel;
    severity: RiskLevel;
    columnId?: string;
    taskId?: string;
}


export interface Project {
    id: string;
    name: string;
    objectiveId: string;
    color?: string;
    description?: string;
    missionStatement?: string;
    memberIds?: string[];
    isDefault?: boolean;
    isArchived?: boolean;
    customFieldDefinitions?: CustomFieldDefinition[];
    enabledViews?: ViewMode[]; // deprecated in favor of board-level setting
    projectScope?: string;
    objectiveAlignmentExplanation?: string;
    impactIfNotDone?: string;
    projectGoals?: string;
    risks?: ProjectRisk[];
    resources?: Resources;
}

export interface TaskFieldLabels {
    assigneeId: string;
    status: string;
    startDate: string;
    dueDate: string;
    progress: string;
    recurrence: string;
    numericValue: string;
}

export interface Document {
    id: string;
    title: string;
    content: string; // Can be complex, but string for now
    creatorId: string;
    createdAt: string;
    lastUpdatedAt: string;
    statusId: string;
    parentId?: string;
    subtaskId?: string;
    icon?: string;
}

export interface DocumentStatus {
    id: string;
    label: string;
    color: string;
}

export interface FormFieldOption {
    id: string;
    label: string;
}

export type FormFieldType = 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'EMAIL' | 'DATE' | 'SELECT' | 'RADIO' | 'CHECKBOX' | 'RATING' | 'CONFIRMATION' | 'APPROVAL' | 'FILE_UPLOAD' | 'SIGNATURE' | 'SECTION' | 'MATRIX_SINGLE' | 'DYNAMIC_TABLE' | 'COST' | 'USER' | 'DOCUMENT' | 'FORM' | 'PHONE';

export interface CalculationSettings {
    optionScores?: OptionScore[];
    valueScores?: ValueScore[];
    ratingScores?: { [rating: number]: number };
    numberRules?: {
        rules: NumberCalculationRule[];
        defaultScore: number;
    };
}

export interface ValueScore {
    value: string | boolean;
    score: number;
}

export interface OptionScore {
    optionId: string;
    score: number;
}

export type NumberCalculationCondition = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';

export interface NumberCalculationRule {
    id: string;
    condition: NumberCalculationCondition;
    value1: number;
    value2?: number; // for BETWEEN
    score: number;
}

export interface FormField {
    id: string;
    type: FormFieldType;
    label: string;

    isRequired?: boolean;
    placeholder?: string;
    options?: FormFieldOption[];
    matrixRows?: FormFieldOption[];
    matrixColumns?: FormFieldOption[];
    subFields?: FormField[]; // For dynamic table
    description?: string;
    icon?: string;
    calculationConfig?: CalculationSettings;
    signerUserIds?: string[];
    allowPhoto?: boolean;
    allowNote?: boolean;
}

export interface FormVariable {
    id: string;
    name: string;
    icon: string;
    purpose: string;
    label: string;
    fieldIds: string[];
}

export interface Form {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    fields: FormField[];
    creatorId: string;
    dueDate?: string;
    recurrence?: Recurrence;
    isPinned?: boolean;
    formCode?: string;
    approvalDate?: string;
    version?: string;
    unit?: string;
    approvalCode?: string;
    documentRequestNumber?: string;
    nextSerialNumber?: number;
    displayMode?: 'SINGLE_PAGE' | 'MULTI_STEP';
    enableCalculations?: boolean;
    maxScore?: number;
    variables?: FormVariable[];
    boardId?: string;
    columnId?: string;
}

export interface FormFieldValue {
    fieldId: string;
    label: string;
    value: any;
    photo?: string;
    note?: string;
}

export interface FormSubmission {
    id: string;
    formId: string;
    submittedAt: string;
    submittedById: string;
    values: FormFieldValue[];
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    serialNumber?: number;
}

export interface FormCategory {
    id: string;
    title: string;
    color?: string;
}

export interface Process {
    id: string;
    name: string;
    description: string;
    unit: string;
    icon: string;
    color: string;
    variableIds: string[];
}

export interface Strategy {
    id: string;
    name: string;
    description: string;
    icon: string;
    ownerIds: string[];
    isArchived?: boolean;
    category: StrategyCategory;
    status: StrategyStatus;
    startDate?: string;
    endDate?: string;
    swot?: SwotData;
}

export interface Index {
    id: string;
    name: string;
    category: string;
    icon: string;
    ownerIds: string[];
    isArchived?: boolean;
}

export interface SwotData {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
}

export type StrategyCategory = 'توسعه محصول' | 'رشد بازار' | 'بهره‌وری عملیاتی' | 'تجربه مشتری';
export type StrategyStatus = 'در حال برنامه ریزی' | 'در حال اجرا' | 'کامل شده' | 'متوقف شده';
export type CustomerNeedCategory = 'ESSENTIAL' | 'PERFORMANCE' | 'MOTIVATIONAL';
export interface CustomerNeed {
    id: string;
    description: string;
    category: CustomerNeedCategory;
}
export interface SuggestedStrategy {
    title: string;
    reasoning: string;
}
export interface SuggestedApproach {
    title: string;
    strategies: SuggestedStrategy[];
}
export type FeedbackCategory = 'SKILL' | 'PERFORMANCE' | 'LEARNING' | 'CHALLENGE_SOLVING' | 'ENCOURAGEMENT' | 'COACHING';

export interface GeneralFeedback {
    id: string;
    giverId: string;
    receiverId: string;
    category: FeedbackCategory;
    comment: string;
    tagIds: string[];
    createdAt: string;
    attachedTaskIds?: string[];
    attachedFormIds?: string[];
    attachedLearningResourceIds?: { id: string; type: LearningResourceType }[];
    coachingSession?: CoachingSession;
}
export interface CoachingSession {
    coachingType: string;
    subject: string;
    problem: string;
    session: { question: string, answer: string }[];
}


// FIX: Changed LearningResourceType to an enum to be used as a value.
export enum LearningResourceType {
    MICRO_LEARNING = 'MICRO_LEARNING',
    YOUTUBE_VIDEO = 'YOUTUBE_VIDEO',
    BOOK = 'BOOK',
}
export interface LearningResource {
    id: string;
    skillIds?: string[];
}
export interface MicroLearning extends LearningResource {
    topic: string;
    generatedText: string;
    quiz?: QuizQuestion[];
}
export interface YouTubeVideo extends LearningResource {
    title: string;
    url: string;
}
export interface Book extends LearningResource {
    title: string;
    author: string;
}
export enum LearningAssignmentStatus {
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}
export interface LearningAssignment {
    id: string;
    assigneeId: string;
    assignerId: string;
    resourceId: string;
    resourceType: LearningResourceType;
    status: LearningAssignmentStatus;
    triggerFeedbackId?: string;
    triggerObjectiveId?: string;
}
export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}
export interface FeedbackTag {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}
export interface FoundationSkill {
    id: string;
    label: string;
    description: string;
    Icon: string;
    progress: number;
    isVisible?: boolean;
}
export interface Specialization {
    id: string;
    label: string;
    rating: number; // 1-5
    isVisible?: boolean;
}
export interface PersonalityMBTI {
    energy: number; // 0 (Introvert) to 100 (Extravert)
    information: number; // 0 (Sensing) to 100 (Intuition)
    decision: number; // 0 (Thinking) to 100 (Feeling)
    lifestyle: number; // 0 (Judging) to 100 (Perceiving)
}
export interface PersonalityDISC {
    D: number;
    I: number;
    S: number;
    C: number;
}
export interface PersonalityHolland {
    R: number; I: number; A: number; S: number; E: number; C: number;
}
export interface Personality {
    mbti?: PersonalityMBTI;
    disc?: PersonalityDISC;
    holland?: PersonalityHolland;
}
export interface Workspace {
    id: string;
    name: string;
    description?: string;
    icon: string;
    color: string;
    type: 'company' | 'individual';
    companyName?: string;
}
export interface RecurrenceSettings {}
export interface AppSettings {
    enabledViewModes: ViewMode[];
    timezone: string;
}
export type SidebarTheme = 'default' | 'modern' | 'visual' | 'compact';
export interface SidebarConfig {
    navItems: NavItem[];
    anjamButtonStyle: 'default' | 'prominent';
    theme: SidebarTheme;
}
export type NavItem = {
    id: ActivePage;
    type: 'item';
    label: string;
    Icon: React.FC<any>;
    location?: 'main' | 'more';
    visible: boolean;
} | {
    type: 'divider';
};
export type ActivePage = 'dashboard' | 'kanban' | 'anjam' | 'reports' | 'forms' | 'documents' | 'strategy' | 'teams' | 'learning' | 'feedback' | 'insights' | 'settings';

export interface Notification {
    id: string;
    isRead: boolean;
    type: 'task' | 'objective' | 'feedback' | 'mention';
    title: string;
    summary: string;
    timestamp: string; // ISO string
}
export type DocumentBlockType = 'paragraph' | 'heading1' | 'checklist' | 'numberedList' | 'table';
export interface ChecklistContent {
    text: string;
    checked: boolean;
}
export interface DocumentBlock {
    id: string;
    type: DocumentBlockType;
    content: string | ChecklistContent;
    textAlign?: 'left' | 'center' | 'right';
}

export type AIDisplayContentType = 'form' | 'kanban' | 'anjam' | 'objective';
export interface AIDisplayContent {
    type: AIDisplayContentType;
    id: string; // ID of the item to display (e.g., formId, projectId)
}

export interface Consultant {
  id: string;
  name: string;
  specialty: string;
  color: string;
  systemInstruction: string;
}

export interface MonitoringData {
    temperature: number;
    cost: number;
    pieceCount: number;
    responsiblePersonId: string;
    category: string;
}
export interface SuggestedHypothesis {
    hypothesisText: string;
    impact: { score: number; reasoning: string };
    effort: { score: number; reasoning: string };
    confidence: { score: number; reasoning: string };
    suggestedProject: string;
}

export interface AISuggestedSkill {
    skillId: string;
    reasoning: string;
}

export interface AITaskEstimation {
    taskId: string;
    estimatedDuration: number; // in days
    reasoning: string;
}

export interface AISuggestedRisk {
    description: string;
    likelihood: RiskLevel;
    severity: RiskLevel;
    relatedTaskContent: string;
}
export interface AITalentSuggestion {
    taskContent: string;
    suggestedUserId: string;
    reasoning: string;
    matchScore: number;
}

declare global {
  interface Window {
    jspdf: any;
    triggerCreateForm: () => void;
  }
}

declare var html2canvas: any;
declare var jspdf: any;
declare var XLSX: any;
declare var confetti: any;