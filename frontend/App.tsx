import React, { useState, useEffect, useMemo } from 'react';
// FIX: Added many missing types from types.ts
import { User, Objective, KeyResult, CheckIn, ObjectiveSettings, ComponentStyles, KRStatus, CompanyVision, Comment, FeedbackTag, GeneralFeedback, FeedbackCategory, LearningAssignment, LearningAssignmentStatus, MicroLearning, YouTubeVideo, Book, LearningResource, LearningResourceType, Team, Task, Form, FormSubmission, Process, Strategy, Document, FoundationSkill, Specialization, ActivePage, NavItem, SidebarConfig, RecurrenceSettings, AppSettings, Consultant } from './types';
import { MOCK_USERS, MOCK_OBJECTIVES, MOCK_COMPANY_VISION } from './mockData';
import { AIPrompts, DEFAULT_AI_PROMPTS } from './services/geminiService';
import { apiClient } from './services/api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import EditProfileModal from './components/EditProfileModal';
import ObjectiveSidePanel from './components/ObjectiveSidePanel';
import ObjectiveCreationWizard from './components/ObjectiveCreationWizard';
import SmartObjectiveWizard from './components/SmartObjectiveWizard';
import EditObjectiveModal from './components/EditObjectiveModal';
import ConfirmationModal from './components/ConfirmationModal';
import ArchivedItemsModal from './components/ArchivedItemsModal';
import AddKeyResultModal from './components/AddKeyResultModal';
import EditKeyResultModal from './components/EditKeyResultModal';
import UpdateKRModal from './components/UpdateKRModal';
import { ObjectiveCategoryId } from './types';

type Theme = 'light' | 'dark';

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setInternalState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setState: React.Dispatch<React.SetStateAction<T>> = (newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
      setInternalState(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  };


  return [state, setState];
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = usePersistentState<User | null>('tickup_currentUser', null);
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const [users, setUsers] = usePersistentState<User[]>('tickup_users', MOCK_USERS);
    const [objectives, setObjectives] = usePersistentState<Objective[]>('tickup_objectives', MOCK_OBJECTIVES);
    const [companyVision, setCompanyVision] = usePersistentState<CompanyVision>('tickup_companyVision', MOCK_COMPANY_VISION);

    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
    const [initialKRId, setInitialKRId] = useState<string | null>(null);
    const [isObjectiveWizardOpen, setIsObjectiveWizardOpen] = useState(false);
    const [isSmartWizardOpen, setIsSmartWizardOpen] = useState(false);
    const [objectiveToEdit, setObjectiveToEdit] = useState<Objective | null>(null);
    const [keyResultToEdit, setKeyResultToEdit] = useState<{ objectiveId: string; krId: string } | null>(null);
    const [isAddKrModalOpen, setIsAddKrModalOpen] = useState(false);
    const [confirmation, setConfirmation] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
    const [krToCheckin, setKrToCheckin] = useState<{ objectiveId: string, krId: string } | null>(null);

    const [theme, setTheme] = usePersistentState<Theme>('theme', 'light');
    
    const [aiPrompts, setAIPrompts] = usePersistentState<AIPrompts>('tickup_aiPrompts', DEFAULT_AI_PROMPTS);
    const [objectiveSettings, setObjectiveSettings] = usePersistentState<ObjectiveSettings>('tickup_objectiveSettings', { hierarchicalViewStyle: 'ADVANCED_ORG_CHART' });
    const [componentStyles, setComponentStyles] = usePersistentState<ComponentStyles>('tickup_componentStyles', {
        popups: { fontFamily: 'Vazirmatn, sans-serif', fontSize: 'base', primaryColor: '#2563EB', backgroundColor: 'bg-white' },
        strategyCards: { fontFamily: 'Vazirmatn, sans-serif', fontSize: 'base', primaryColor: '#2563EB', backgroundColor: 'bg-white' },
    });
    
    const handleLogin = async (username: string, password: string) => {
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const response = await apiClient.auth.login(username, password);

            if (response.user && response.token) {
                // Store token in localStorage
                localStorage.setItem('auth_token', response.token);

                // Set current user
                setCurrentUser(response.user as any);

                // Load live data from backend
                const [apiObjectives, apiUsers] = await Promise.all([
                    apiClient.objectives.list(),
                    apiClient.users.list(),
                ]);

                if (Array.isArray(apiObjectives) && apiObjectives.length > 0) {
                    setObjectives(apiObjectives as any);
                }
                if (Array.isArray(apiUsers) && apiUsers.length > 0) {
                    setUsers(apiUsers as any);
                }
            }
        } catch (error: any) {
            console.error('Login failed:', error);
            setLoginError(error.message || 'نام کاربری یا رمز عبور اشتباه است.');
        } finally {
            setIsLoggingIn(false);
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const selectedObjective = useMemo(() =>
        selectedObjectiveId ? objectives.find(o => o.id === selectedObjectiveId) : null
    , [selectedObjectiveId, objectives]);
    
    const keyResultToEditData = useMemo(() => {
        if (!keyResultToEdit) return null;
        const objective = objectives.find(o => o.id === keyResultToEdit.objectiveId);
        const kr = objective?.keyResults.find(k => k.id === keyResultToEdit.krId);
        if (!objective || !kr) return null;
        return { objectiveId: objective.id, kr };
    }, [keyResultToEdit, objectives]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // On app start, try to fetch live users and objectives from the backend.
    // This keeps the UI from relying on stale/mock data in localStorage.
    useEffect(() => {
        const loadLiveData = async () => {
            try {
                const [apiObjectives, apiUsers] = await Promise.all([
                    apiClient.objectives.list(),
                    apiClient.users.list(),
                ]);
                if (Array.isArray(apiObjectives) && apiObjectives.length > 0) {
                    setObjectives(apiObjectives as any);
                }
                if (Array.isArray(apiUsers) && apiUsers.length > 0) {
                    setUsers(apiUsers as any);
                }
            } catch (err) {
                console.warn('Could not load live objectives/users — using local data.', err);
            }
        };

        loadLiveData();
    }, []);
    
    const handleUpdateUser = (userId: string, name: string, username: string, password?: string, signatureUrl?: string | null) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, name, username, password: password || u.password, signatureUrl: signatureUrl === null ? undefined : signatureUrl || u.signatureUrl } : u));
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, name, username, password: password || prev.password, signatureUrl: signatureUrl === null ? undefined : signatureUrl || prev.signatureUrl } : null);
        }
    }

    const handleSaveObjective = async (objectiveData: Omit<Objective, 'id' | 'keyResults'>, keyResultsData: Omit<KeyResult, 'id'>[]) => {
        try {
            // Call API to create objective
            const apiResponse = await apiClient.objectives.create({
                title: objectiveData.title,
                description: objectiveData.description,
                category: objectiveData.category || 'BUSINESS_GROWTH',
                color: objectiveData.color || 'gray',
                quarter: objectiveData.quarter,
                endDate: objectiveData.endDate,
                ownerId: objectiveData.ownerId,
                parentId: objectiveData.parentId,
            });

            // Backend may return either the created objective directly or an object
            // like { objective, warning } when the parentId was ignored. Normalize it.
            let createdObjective: any = apiResponse;
            if (apiResponse && apiResponse.objective) {
                createdObjective = apiResponse.objective;
                if (apiResponse.warning) {
                    console.warn('Objective created with warning:', apiResponse.warning);
                    alert(apiResponse.warning);
                }
            }

            // Add key results to the created objective
            const keyResultsWithIds = keyResultsData.map((kr, i) => ({
                ...kr,
                id: `kr-${Date.now()}-${i}`,
                currentValue: kr.startValue || 0,
                checkIns: [],
            }));

            // Create objective with key results in local state as fallback
            const newObjective: Objective = {
                ...createdObjective,
                keyResults: keyResultsWithIds,
            };

            // Update local state
            setObjectives(prev => [...prev, newObjective]);
            setIsObjectiveWizardOpen(false);
            setIsSmartWizardOpen(false);
            
            return newObjective; // Return new objective for AI chat panel
        } catch (error) {
            console.error('Error saving objective:', error);
            // Fallback to local state
            const newObjective: Objective = {
                ...objectiveData,
                id: `obj-${Date.now()}`,
                keyResults: keyResultsData.map((kr, i) => ({
                    ...kr,
                    id: `kr-${Date.now()}-${i}`,
                    currentValue: kr.startValue || 0,
                    checkIns: [],
                })),
            };
            setObjectives(prev => [...prev, newObjective]);
            setIsObjectiveWizardOpen(false);
            setIsSmartWizardOpen(false);
            return newObjective;
        }
    };

    const handleAddKeyResult = (krSubmission: Omit<KeyResult, 'id' | 'checkIns' | 'currentValue'> & { objectiveId?: string }) => {
        if (!krSubmission.objectiveId) return;
        const { objectiveId, ...krData } = krSubmission;

        setObjectives(prev => prev.map(obj => {
            if (obj.id === objectiveId) {
                const newKeyResult: KeyResult = {
                    ...(krData as Omit<KeyResult, 'id'>),
                    id: `kr-${Date.now()}`,
                    currentValue: krData.startValue ?? 0,
                    checkIns: [],
                };
                return { ...obj, keyResults: [...obj.keyResults, newKeyResult] };
            }
            return obj;
        }));
        setIsAddKrModalOpen(false);
    };

    const handleKeyResultCheckin = (objectiveId: string, krId: string, value: number, rating: number, report: {tasksDone: string, tasksNext: string, challenges: string}, challengeDifficulty: number, challengeTagIds: string[], status?: KRStatus) => {
        setObjectives(prev => prev.map(obj => {
            if (obj.id !== objectiveId) return obj;
            return {
                ...obj,
                keyResults: obj.keyResults.map(kr => {
                    if (kr.id !== krId) return kr;
                    const newCheckin: CheckIn = { id: `ci-${Date.now()}`, date: new Date().toISOString(), value, rating, report, challengeDifficulty, challengeTagIds };
                    return { 
                        ...kr, 
                        currentValue: value, 
                        checkIns: [...(kr.checkIns || []), newCheckin],
                        ...(status && { status })
                    };
                })
            }
        }));
    };

    const handleKeyResultAddComment = (objectiveId: string, krId: string, text: string) => {
        setObjectives(prev => prev.map(obj => {
            if (obj.id !== objectiveId) return obj;
            return {
                ...obj,
                keyResults: obj.keyResults.map(kr => {
                    if (kr.id !== krId) return kr;
                    const newComment: Comment = { id: `comment-${Date.now()}`, authorId: currentUser!.id, text, createdAt: new Date().toISOString() };
                    return { ...kr, comments: [...(kr.comments || []), newComment] };
                })
            }
        }));
    };
    const handleDeleteObjective = (objectiveId: string) => setConfirmation({ isOpen: true, title: 'حذف هدف', message: 'آیا از حذف این هدف اطمینان دارید؟', onConfirm: () => setObjectives(prev => prev.filter(o => o.id !== objectiveId)) });
    const handleDeleteKeyResult = (objectiveId: string, keyResultId: string) => setConfirmation({ isOpen: true, title: 'حذف نتیجه کلیدی', message: 'آیا از حذف این نتیجه کلیدی اطمینان دارید؟', onConfirm: () => setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.filter(kr => kr.id !== keyResultId) } : o)) });
    const handleUpdateObjectiveDetails = (objectiveId: string, title: string, description: string, category: ObjectiveCategoryId, parentId: string | undefined, color: string, endDate: string | undefined, isDefault: boolean, quarter: string | undefined) => setObjectives(prev => {
        let newObjectives = [...prev];
        if (isDefault) {
            newObjectives = newObjectives.map(o => o.id !== objectiveId ? { ...o, isDefault: false } : o);
        }
        return newObjectives.map(o => o.id === objectiveId ? { ...o, title, description, category, parentId, color, endDate, isDefault, quarter } : o);
    });
    
    const handleUpdateKeyResultDetails = (objectiveId: string, krId: string, updates: Partial<KeyResult>) => {
        setObjectives(prev => prev.map(o => {
            if (o.id === objectiveId) {
                const newKeyResults = o.keyResults.map(k => k.id === krId ? { ...k, ...updates } : k);
                return { ...o, keyResults: newKeyResults };
            }
            return o;
        }));
    };
    const handleArchiveObjective = (objectiveId: string) => setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, isArchived: true } : o));
    const handleUnarchiveObjective = (objectiveId: string) => setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, isArchived: false } : o));
    const handleArchiveKeyResult = (objectiveId: string, keyResultId: string) => setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(kr => kr.id === keyResultId ? { ...kr, isArchived: true } : kr) } : o));
    const handleUnarchiveKeyResult = (objectiveId: string, keyResultId: string) => setObjectives(prev => prev.map(o => o.id === objectiveId ? { ...o, keyResults: o.keyResults.map(kr => kr.id === keyResultId ? { ...kr, isArchived: false } : kr) } : o));
    const handleSelectKeyResult = (objectiveId: string, krId: string) => {
        setSelectedObjectiveId(objectiveId);
        setInitialKRId(krId);
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} error={loginError} isLoading={isLoggingIn} />;
    }
    
    const objectivePanelProps = {
        objective: selectedObjective,
        users,
        objectives,
        onClose: () => {
            setSelectedObjectiveId(null);
            setInitialKRId(null);
        },
        onDeleteKeyResult: handleDeleteKeyResult,
        onUpdateKeyResultDetails: handleUpdateKeyResultDetails,
        onEditKeyResult: (krId: string) => {
            if (selectedObjectiveId) {
                setKeyResultToEdit({ objectiveId: selectedObjectiveId, krId: krId });
            }
        },
        onArchiveKeyResult: handleArchiveKeyResult,
        onCheckin: handleKeyResultCheckin,
        onAddComment: handleKeyResultAddComment,
        challengeTags: [],
        currentUser: currentUser!,
        isFullscreen: false, // You might want to manage this state here if needed globally
        onToggleFullscreen: () => {},
        onOpenProgramDesigner: (objId: string, krId: string) => {},
        // Props that are no longer needed
        projects: [],
        tasks: [],
        documents: [],
        boards: [],
        onNavigateToBoardFromKR: () => {},
        onOpenDocument: () => {},
        onSelectTask: () => {},
        strategies: [],
        indices: [],
    };

    return (
        <div className="flex h-screen bg-brand-secondary dark:bg-slate-900" dir="rtl">
            <Sidebar
                currentUser={currentUser}
                onLogout={handleLogout}
                onEditProfile={() => setIsEditProfileModalOpen(true)}
                onViewProfile={() => {}}
                sidebarConfig={{ navItems: [] } as any}
            />
            
            <div className={`flex-1 flex flex-row overflow-hidden md:mr-64`}>
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                    <Header
                        pageTitle="اهداف"
                        onOpenArchivedModal={() => setIsArchivedModalOpen(true)}
                        onExportProgram={() => window.dispatchEvent(new CustomEvent('exportProgramView'))}
                    />
                    <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-800">
                        <div className="p-4 md:p-6 h-full">
                            <DashboardPage 
                                objectives={objectives} users={users} onSelectObjective={(obj) => setSelectedObjectiveId(obj.id)}
                                onAddNewObjective={() => setIsObjectiveWizardOpen(true)}
                                onSelectKeyResult={handleSelectKeyResult} onOpenAddKrModal={() => setIsAddKrModalOpen(true)}
                                onEditObjective={setObjectiveToEdit}
                                onDeleteObjective={handleDeleteObjective} onDeleteKeyResult={handleDeleteKeyResult} onUpdateKeyResultDetails={handleUpdateKeyResultDetails}
                                objectiveSettings={objectiveSettings} onArchiveObjective={handleArchiveObjective} onArchiveKeyResult={handleArchiveKeyResult}
                                onStartSmartWizard={() => setIsSmartWizardOpen(true)}
                                onEditKeyResult={(objectiveId, krId) => setKeyResultToEdit({ objectiveId, krId })}
                                // FIX: Added missing prop
                                onAddKeyResult={() => setIsAddKrModalOpen(true)}
                            />
                        </div>
                    </main>
                </div>
            </div>

            {/* Global Modals & Side Panels */}
            {isEditProfileModalOpen && <EditProfileModal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} user={currentUser} onSubmit={handleUpdateUser} />}
            {selectedObjective && <ObjectiveSidePanel {...objectivePanelProps} />}
            {isObjectiveWizardOpen && <ObjectiveCreationWizard isOpen={isObjectiveWizardOpen} onClose={() => setIsObjectiveWizardOpen(false)} onSubmit={handleSaveObjective as any} users={users} objectives={objectives} defaultOwnerId={currentUser.id} styleSettings={componentStyles.popups} aiPrompts={aiPrompts} />}
            {isSmartWizardOpen && <SmartObjectiveWizard isOpen={isSmartWizardOpen} onClose={() => setIsSmartWizardOpen(false)} onSubmit={handleSaveObjective as any} users={users} defaultOwnerId={currentUser.id} styleSettings={componentStyles.popups} aiPrompts={aiPrompts} companyVision={companyVision} />}
            {/* FIX: Changed onSubmit prop to pass handleUpdateObjectiveDetails directly */}
            {objectiveToEdit && <EditObjectiveModal isOpen={!!objectiveToEdit} onClose={() => setObjectiveToEdit(null)} objective={objectiveToEdit} objectives={objectives} onSubmit={handleUpdateObjectiveDetails} />}
            {keyResultToEditData && (
                <EditKeyResultModal
                    isOpen={!!keyResultToEditData}
                    onClose={() => setKeyResultToEdit(null)}
                    kr={keyResultToEditData.kr}
                    objectiveId={keyResultToEditData.objectiveId}
                    users={users}
                    onUpdate={handleUpdateKeyResultDetails}
                />
            )}
            {isAddKrModalOpen && (
                <AddKeyResultModal
                    isOpen={isAddKrModalOpen}
                    onClose={() => setIsAddKrModalOpen(false)}
                    objectives={objectives.filter(o => !o.isArchived)}
                    users={users}
                    onAddKeyResult={handleAddKeyResult}
                    aiPrompts={aiPrompts}
                    styleSettings={componentStyles.popups}
                />
            )}
            {confirmation.isOpen && <ConfirmationModal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} onConfirm={() => { confirmation.onConfirm(); setConfirmation({ ...confirmation, isOpen: false }); }} title={confirmation.title} message={confirmation.message} />}
            {isArchivedModalOpen && <ArchivedItemsModal isOpen={isArchivedModalOpen} onClose={() => setIsArchivedModalOpen(false)} objectives={objectives} onUnarchiveObjective={handleUnarchiveObjective} onUnarchiveKeyResult={handleUnarchiveKeyResult} />}
            {krToCheckin && (
                <UpdateKRModal
                    isOpen={!!krToCheckin}
                    onClose={() => setKrToCheckin(null)}
                    kr={objectives.find(o => o.id === krToCheckin.objectiveId)?.keyResults.find(k => k.id === krToCheckin.krId)!}
                    onSubmit={handleKeyResultCheckin as any}
                    challengeTags={[]}
                    objectives={objectives}
                />
            )}
        </div>
    );
};

export default App;
