import { apiRequest } from "./queryClient";
import { getResumeSettings } from "./settingsService";

// Resume and cover letter generation
export const generateResume = async (data: {
  name: string;
  specialization: string;
  experience: string;
  projects: string;
  type?: string;
  targetCompany?: string;
  jobDescription?: string;
  useAdditionalSettings?: boolean;
}) => {
  try {
    // If this is a cover letter, adjust the specialization field to identify it correctly
    const payload = { ...data };
    
    if (data.type === "coverLetter") {
      payload.specialization = "Cover Letter";
    }
    
    // If useAdditionalSettings is true, enrich the experience with additional settings
    if (data.useAdditionalSettings !== false) {
      try {
        // Get additional resume settings 
        const settings = await getResumeSettings();
        
        // Only add additional information if it's not already in the experience text
        if (!data.experience.includes("Skills:") && settings.skills) {
          const skillsSection = `\n\nSkills: ${settings.skills}`;
          payload.experience = payload.experience + skillsSection;
        }
        
        if (!data.experience.includes("Languages:") && settings.languages) {
          const languagesSection = `\n\nLanguages: ${settings.languages}`;
          payload.experience = payload.experience + languagesSection;
        }
        
        // Only add education if it's not explicitly included in the experience
        if (!data.experience.includes("Education:") && settings.education) {
          const educationSection = `\n\nEducation: ${settings.education}`;
          payload.experience = payload.experience + educationSection;
        }
      } catch (error) {
        // If we fail to get settings, just continue with original data
        console.error("Failed to load additional resume settings:", error);
      }
    }
    
    const response = await apiRequest("POST", "/api/resumes", payload);
    return await response.json();
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(`Failed to generate ${data.type === "coverLetter" ? "cover letter" : "resume"}. Please try again later.`);
  }
};
