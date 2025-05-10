import { apiRequest } from "./queryClient";

// Resume Settings Types
export interface ResumeSettings {
  defaultTitle: string;
  skills: string;
  languages: string;
  education: string;
  experience: string;
  defaultTemplate: string;
}

// Default Resume Settings
const defaultResumeSettings: ResumeSettings = {
  defaultTitle: "Professional Translator Resume",
  skills: "Translation, Editing, Proofreading, Content Writing, Localization",
  languages: "English (Native), French (Fluent), Spanish (Intermediate)",
  education: "BA in Linguistics, University of California, 2018",
  experience: "Freelance Translator (2018-Present)\n- Translated over 50 documents for various clients\n- Specialized in technical and marketing content",
  defaultTemplate: "professional",
};

// In-memory storage for settings (in a real app, this would be stored in the backend)
let resumeSettings = { ...defaultResumeSettings };

/**
 * Saves resume settings
 */
export const saveResumeSettings = async (settings: ResumeSettings): Promise<ResumeSettings> => {
  // In a real implementation, this would be an API call
  resumeSettings = { ...settings };
  
  // For future backend implementation:
  // return await apiRequest("POST", "/api/settings/resume", settings);
  
  return resumeSettings;
};

/**
 * Gets the resume settings
 */
export const getResumeSettings = async (): Promise<ResumeSettings> => {
  // In a real implementation, this would be an API call  
  // For future backend implementation:
  // return await apiRequest("GET", "/api/settings/resume");
  
  return resumeSettings;
};