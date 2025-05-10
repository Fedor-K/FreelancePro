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
  targetProject?: string;
  useAdditionalSettings?: boolean;
  id?: number;           // Existing resume ID for editing
  isEditing?: boolean;   // Flag to indicate we're editing
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
        
        // Add the target project information if provided
        if (data.targetProject) {
          payload.jobDescription = data.targetProject;
          
          // Include a note for the AI to focus on this specific project
          const targetNote = `\n\nNOTE: This resume is specifically tailored for the following job/project: ${data.targetProject}`;
          payload.experience = payload.experience + targetNote;
        }
      } catch (error) {
        // If we fail to get settings, just continue with original data
        console.error("Failed to load additional resume settings:", error);
      }
    }
    
    let response;
    
    // If we're editing an existing resume
    if (data.isEditing && data.id) {
      // Use PATCH to update the existing resume
      response = await apiRequest("PATCH", `/api/resumes/${data.id}`, payload);
    } else {
      // Use POST to create a new resume
      response = await apiRequest("POST", "/api/resumes", payload);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(`Failed to generate ${data.type === "coverLetter" ? "cover letter" : "resume"}. Please try again later.`);
  }
};
