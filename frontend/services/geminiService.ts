import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
// FIX: Added missing imports
import { KRType, SuggestedKR, Objective, User, SuggestedPerspective, CompanyVision, KeyResult, SuggestedObjectiveWithKRs, MicroLearning, QuizQuestion, Task, FoundationSkill, Specialization, AISuggestedSkill, AITaskEstimation, AISuggestedRisk, AITalentSuggestion, RiskLevel, SuggestedApproach, SuggestedStrategy, FormFieldType } from '../types';

// Check if API key is available
const hasApiKey = !!process.env.API_KEY;
if (!hasApiKey) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

// Initialize AI only if API key is available
const ai = hasApiKey ? new GoogleGenAI({ apiKey: process.env.API_KEY! }) : null;

// FIX: Added missing interface
export interface SuggestedMission {
    missionTitle: string;
    iconName: string;
    reasoning: {
        passion: string;
        skill: string;
        market: string;
        business: string;
    }
}

// FIX: Add GeneratedFormField interface
export interface GeneratedFormField {
    label: string;
    type: FormFieldType;
    isRequired?: boolean;
    placeholder?: string;
    options?: string[];
    icon?: string;
    matrixRows?: string[];
    matrixColumns?: string[];
}


export interface AIPrompts {
  suggestKeyResults: string;
  analyzeOKRData: string;
  generateSmartObjectives: string;
  // FIX: Added missing prompts
  analyzeIndividualPerformance: string;
  generateMicroLearning: string;
  generateQuizForText: string;
  analyzeTaskScope: string;
  generateProgramHypotheses: string;
  generateStrategyQuestions: string;
  generateStrategySuggestions: string;
  generateSkillSuggestions: string,
  estimateTaskDurations: string;
  analyzeColumnRisks: string;
  suggestTalentForColumn: string;
  generateTaskInstructions: string;
  generateCoachingQuestions: string;
  // FIX: Added missing prompt for generateSubtasks
  generateSubtasks: string;
  // FIX: Added missing prompt for generateFormFromPrompt
  generateFormFromPrompt: string;
}

export const DEFAULT_AI_PROMPTS: AIPrompts = {
  suggestKeyResults: `Based on the following objective, suggest 3-4 specific, measurable, achievable, relevant, and time-bound (SMART) Key Results.
        Objective Title: "{{objectiveTitle}}"
        Objective Description: "{{objectiveDescription}}"
        
        For each Key Result, provide a title, a type ('NUMBER', 'PERCENTAGE', or 'CURRENCY'), a startValue, and a targetValue. The startValue for new goals is typically 0.`,
  
  analyzeOKRData: `
    Analyze the following OKR data for a company.

    Data:
    {{data}}

    Provide a concise but insightful analysis in Persian, covering these points:
    1.  **Overall Performance Summary:** Give a brief overview of the company's progress towards its goals. Calculate the average completion percentage.
    2.  **Key Strengths:** Identify which objectives or teams are performing well and why. Point out positive trends.
    3.  **Areas for Improvement:** Identify objectives that are lagging or at risk. What are the potential bottlenecks or challenges based on the data?
    4.  **Actionable Recommendations:** Suggest 2-3 specific actions the leadership could take to improve performance, address challenges, or better align teams.

    Format the response clearly using Markdown with Persian headings.
  `,

  generateSmartObjectives: `
    As an expert OKR and business strategy coach, your task is to generate insightful strategic perspectives and corresponding SMART objectives based on user input.

    **User's Input:**
    - **Goal Idea & Description:** "{{goalDescription}}"
    - **Motivations for this Goal:** "{{motivation}}"
    - **Team & Expertise:** "{{teamExpertise}}"
    
    **Your Task:**
    Generate 2-3 distinct "Strategic Perspectives". A perspective is a unique angle or theme for approaching the user's goal.
    For each perspective, provide:
    1.  A "perspectiveTitle": A concise, inspiring title for the strategic angle.
    2.  A "perspectiveDescription": A one-sentence explanation of this angle.
    3.  A list of 1-2 "objectives". For each objective:
        - An "objectiveTitle": A clear, ambitious title for the Objective.
        - An "objectiveDescription": A brief description of what success looks like.
        - A list of 2-3 "keyResults". For each Key Result:
            - A "title".
            - A "type" ('NUMBER', 'PERCENTAGE', 'CURRENCY').
            - A "startValue".
            - A "targetValue".
    
    Focus on creating diverse, actionable, and insightful perspectives that directly connect to the user's inputs.
`,
// FIX: Added missing default prompts
  analyzeIndividualPerformance: 'Analyze individual performance based on the provided data.',
  generateMicroLearning: 'Generate micro-learning content on the given topic.',
  generateQuizForText: 'Generate a quiz for the provided text.',
  analyzeTaskScope: 'Analyze if tasks are within the project scope.',
  generateProgramHypotheses: 'Generate hypotheses for the program.',
  generateStrategyQuestions: 'Generate questions for strategy planning.',
  generateStrategySuggestions: 'Generate strategy suggestions.',
  generateSkillSuggestions: 'Suggest required skills for the given tasks.',
  estimateTaskDurations: 'Estimate durations for the given tasks.',
  analyzeColumnRisks: 'Analyze risks for the given Kanban column.',
  suggestTalentForColumn: 'Suggest talent for the given Kanban column.',
  generateTaskInstructions: 'Generate instructions for a task.',
  generateCoachingQuestions: 'Generate coaching questions.',
  // FIX: Added default prompt for generateSubtasks
  generateSubtasks: 'Generate subtasks for the given task.',
  // FIX: Added default prompt for generateFormFromPrompt
  generateFormFromPrompt: 'Generate form fields based on the provided prompt.',
};

export const generateSmartObjectives = async (
    input: {
        goalDescription: string;
        motivation: string;
        teamExpertise: string;
        companyVision?: CompanyVision;
    },
    promptTemplate: string
): Promise<SuggestedPerspective[]> => {
    if (!ai) {
        throw new Error("AI features are not available - API key not configured");
    }
        return Promise.reject("API key not available.");
    }
    try {
        const contents = promptTemplate
            .replace('{{goalDescription}}', `"${input.goalDescription}"`)
            .replace('{{motivation}}', `"${input.motivation}"`)
            .replace('{{teamExpertise}}', `"${input.teamExpertise}"`);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        perspectives: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    perspectiveTitle: { type: Type.STRING },
                                    perspectiveDescription: { type: Type.STRING },
                                    objectives: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                objectiveTitle: { type: Type.STRING },
                                                objectiveDescription: { type: Type.STRING },
                                                keyResults: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            title: { type: Type.STRING },
                                                            type: { type: Type.STRING, enum: ['NUMBER', 'PERCENTAGE', 'CURRENCY'] },
                                                            startValue: { type: Type.NUMBER },
                                                            targetValue: { type: Type.NUMBER },
                                                        },
                                                        required: ["title", "type", "startValue", "targetValue"],
                                                    },
                                                },
                                            },
                                            required: ["objectiveTitle", "objectiveDescription", "keyResults"],
                                        },
                                    },
                                },
                                required: ["perspectiveTitle", "perspectiveDescription", "objectives"],
                            },
                        },
                    },
                },
            },
        });
        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

        if (parsedResponse && parsedResponse.perspectives) {
            return parsedResponse.perspectives as SuggestedPerspective[];
        }
        return [];

    } catch (error) {
        console.error("Error generating smart objectives from Gemini API:", error);
        throw new Error("Failed to generate AI smart objectives.");
    }
};

export const suggestKeyResults = async (
  objectiveTitle: string,
  objectiveDescription: string,
  promptTemplate: string,
): Promise<SuggestedKR[]> => {
    if (!ai) {
        throw new Error("AI features are not available - API key not configured");
    }
  try {
    const contents = promptTemplate
        .replace('{{objectiveTitle}}', `"${objectiveTitle}"`)
        .replace('{{objectiveDescription}}', `"${objectiveDescription}"`);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The title of the Key Result.",
                  },
                  type: {
                    type: Type.STRING,
                    description: "The type of the metric (NUMBER, PERCENTAGE, CURRENCY).",
                    enum: ['NUMBER', 'PERCENTAGE', 'CURRENCY'],
                  },
                  startValue: {
                    type: Type.NUMBER,
                    description: "The starting value of the metric.",
                  },
                  targetValue: {
                    type: Type.NUMBER,
                    description: "The target value to be achieved.",
                  },
                },
                required: ["title", "type", "startValue", "targetValue"],
              },
            },
          },
        },
      },
    });
    const jsonText = response.text;
    const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

    if (parsedResponse && parsedResponse.suggestions) {
      return parsedResponse.suggestions;
    }
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw new Error("Failed to generate AI suggestions.");
  }
};


export const analyzeOKRData = async (
  objectives: Objective[],
  users: User[],
  promptTemplate: string
): Promise<string> => {
  if (!process.env.API_KEY) {
      console.error("Gemini API key is not configured.");
      return Promise.reject("API key not available.");
  }

  // Remove password from users data before sending to API
  const sanitizedUsers = users.map(({ password, ...user }) => user);
  const contents = promptTemplate.replace('{{data}}', JSON.stringify({ objectives, users: sanitizedUsers }, null, 2));

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    throw new Error("Failed to generate AI analysis.");
  }
};

// FIX: Add missing function stubs
export const suggestMissions = async (passion: string, expertise: string, skills: { skill: string, rating: number }[], existingTitles: string[]): Promise<SuggestedMission[]> => {
    return Promise.resolve([
        { missionTitle: "ماموریت پیشنهادی ۱", iconName: "RocketIcon", reasoning: { passion: "...", skill: "...", market: "...", business: "..." } },
        { missionTitle: "ماموریت پیشنهادی ۲", iconName: "SparklesIcon", reasoning: { passion: "...", skill: "...", market: "...", business: "..." } },
    ]);
};

export const suggestSkillsFromProfile = async (passion: string, expertise: string, allSkills: { id: string, label: string }[]): Promise<string[]> => {
    return Promise.resolve(['leadership', 'product-management']);
};

export const generateMicroLearning = async (topic: string, prompt: string): Promise<string> => {
    return Promise.resolve(`این یک محتوای آموزشی در مورد ${topic} است.`);
};

export const generateQuizForText = async (text: string, prompt: string): Promise<QuizQuestion[]> => {
    return Promise.resolve([{ questionText: "سوال ۱؟", options: ["گزینه ۱", "گزینه ۲"], correctAnswerIndex: 0 }]);
};

// FIX: Update generateFormFields to return GeneratedFormField[]
export const generateFormFields = async (prompt: string, template: string, file?: { mimeType: string, data: string }): Promise<GeneratedFormField[]> => {
    return Promise.resolve([{ label: "فیلد پیشنهادی", type: 'TEXT' }]);
};

export const analyzeTaskScope = async (scope: string, tasks: {id: string, content: string}[], prompt: string): Promise<{taskId: string, score: number, reason: string}[]> => {
    return Promise.resolve(tasks.map(t => ({ taskId: t.id, score: Math.random() * 100, reason: "This is a reason." })));
};

export const generateProgramHypotheses = async (prompt: string, objective: Objective, kr: KeyResult, answers: any): Promise<any[]> => {
    return Promise.resolve([{ hypothesisText: "فرضیه ۱", impact: { score: 8, reasoning: "" }, effort: { score: 5, reasoning: "" }, confidence: { score: 7, reasoning: "" }, suggestedProject: "پروژه پیشنهادی ۱" }]);
};

export const generateStrategyQuestions = async (prompt: string, template: string): Promise<string[]> => {
    return Promise.resolve(["سوال ۱؟", "سوال ۲؟"]);
};

export const generateStrategySuggestions = async (chatHistory: string, template: string): Promise<SuggestedApproach[]> => {
    return Promise.resolve([{ title: "رویکرد ۱", strategies: [{ title: "استراتژی ۱", reasoning: "..." }] }]);
};

export const generateSkillSuggestions = async (prompt: string, column: string, tasks: Task[], allSkills: (FoundationSkill | Specialization)[]): Promise<AISuggestedSkill[]> => {
    return Promise.resolve([{ skillId: 'leadership', reasoning: 'Because it is important.' }]);
};

export const estimateTaskDurations = async (prompt: string, data: any): Promise<AITaskEstimation[]> => {
    return Promise.resolve(data.tasks.map((t: Task) => ({ taskId: t.id, estimatedDuration: 3, reasoning: 'Based on complexity' })));
};

export const analyzeColumnRisks = async (board: string, column: string, tasks: {content: string}[], prompt: string): Promise<AISuggestedRisk[]> => {
    return Promise.resolve([{ description: "ریسک نمونه", likelihood: 'MEDIUM', severity: 'HIGH', relatedTaskContent: tasks[0].content }]);
};

export const suggestTalentForColumn = async (board: string, column: string, tasks: Task[], users: User[], allTasks: Task[], allObjectives: Objective[], allSkills: (FoundationSkill | Specialization)[], prompt: string): Promise<AITalentSuggestion[]> => {
    return Promise.resolve([{ taskContent: tasks[0].content, suggestedUserId: users[0].id, reasoning: "Most skilled.", matchScore: 95 }]);
};

export const generateTaskInstructions = async (prompt: string, context: any): Promise<string> => {
    return Promise.resolve(`این دستورالعمل برای "${context.taskTitle}" است.`);
};

export const generateCoachingQuestions = async (prompt: string, context: any): Promise<string> => {
    return Promise.resolve("سوال اول؟\nسوال دوم؟");
};

// FIX: Added missing generateSubtasks function
export const generateSubtasks = async (context: any, promptTemplate: string): Promise<string[]> => {
    // This is a mock implementation
    return Promise.resolve([
        `Subtask for ${context.taskTitle} 1`,
        `Subtask for ${context.taskTitle} 2`,
        `Subtask for ${context.taskTitle} 3`,
    ]);
};
