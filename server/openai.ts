import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY environment variable not set. Some AI features may not work.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCoverLetter({
  name,
  jobTitle,
  targetPosition,
  targetCompany,
  selectedProjects,
  jobDescription,
  skills,
}: {
  name: string;
  jobTitle: string;
  targetPosition: string;
  targetCompany: string;
  selectedProjects: any[];
  jobDescription: string;
  skills: string[];
}): Promise<string> {
  try {
    // Extract project information to mention in the cover letter
    const projectDescriptions = selectedProjects
      .map(project => `Project: ${project.name} - ${project.description || 'No description'}`)
      .join("\n");

    // Create the prompt for OpenAI with refined instructions
    const prompt = `
    Write a brief, straightforward, and professional cover letter for a freelance translator named ${name} 
    applying for a ${targetPosition} position at ${targetCompany}.
    
    Current Job Title: ${jobTitle || "Freelance Translator"}
    
    Skills: ${skills ? skills.join(", ") : "translation, proofreading, localization"}
    
    Recent Projects:
    ${projectDescriptions || "Has experience with translation projects across multiple industries."}
    
    Job Description:
    ${jobDescription || "A position requiring translation services, attention to detail, and excellent communication skills."}
    
    IMPORTANT FORMAT RULES:
    - The cover letter should be exactly 3 concise paragraphs
    - Start with ONLY "Dear Hiring Manager," (no date or address header)
    - End with ONLY "Sincerely," followed by the name on a new line (do not repeat "Sincerely," twice)
    - Total length should be brief (around 150-200 words maximum)
    - Do not list project names directly, just briefly mention relevant experience
    - Do not use redundant or flowery language - be direct and professional
    - Focus on the candidate's most relevant skills for this specific position
    - Do not include resume/CV information in the content
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer for freelance translators and localization specialists."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error generating cover letter with OpenAI:", error);
    throw new Error("Failed to generate cover letter. Please try again.");
  }
}