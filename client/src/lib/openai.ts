import { apiRequest } from "./queryClient";

// Resume generation prompt
export const generateResume = async (data: {
  name: string;
  specialization: string;
  experience: string;
  projects: string;
}) => {
  try {
    const response = await apiRequest("POST", "/api/resumes", data);
    return await response.json();
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to generate resume. Please try again later.");
  }
};
