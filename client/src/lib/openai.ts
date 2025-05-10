import { apiRequest } from "./queryClient";

// Resume and cover letter generation
export const generateResume = async (data: {
  name: string;
  specialization: string;
  experience: string;
  projects: string;
  type?: string;
  targetCompany?: string;
  jobDescription?: string;
}) => {
  try {
    // If this is a cover letter, adjust the specialization field to identify it correctly
    const payload = { ...data };
    
    if (data.type === "coverLetter") {
      payload.specialization = "Cover Letter";
    }
    
    const response = await apiRequest("POST", "/api/resumes", payload);
    return await response.json();
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(`Failed to generate ${data.type === "coverLetter" ? "cover letter" : "resume"}. Please try again later.`);
  }
};
