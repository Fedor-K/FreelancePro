import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createResumePreviewHTML } from "@/lib/resumeTemplate";

interface TargetPositionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  nextStep?: () => void;
}

export default function TargetPositionForm({ formData, updateField, nextStep }: TargetPositionFormProps) {
  const { toast } = useToast(); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [cvContent, setCvContent] = useState({
    summary: "",
    skills: "",
    languages: [] as {language: string, level: string}[],
    experience: [] as {title: string, company: string, date: string, description: string}[],
    education: [] as {degree: string, institution: string, date: string, description: string}[],
    projects: [] as {name: string, description: string, languagePair: string}[]
  });
  
  const generateCV = () => {
    if (!formData.targetPosition.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a target position to generate your CV",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Generate resume preview HTML
    setTimeout(() => {
      const html = createResumePreviewHTML(formData);
      setPreviewHtml(html);
      
      // Extract structured content from the CV (simplified example)
      // In a real implementation, you'd want to parse the HTML more carefully
      const newCvContent = {
        summary: formData.summary || "Freelance translator and editor with experience in technical and business translation. Specialized in various language pairs for software, legal, and marketing materials.",
        skills: formData.skills?.join(", ") || "Translation, Localization, Proofreading, CAT Tools, SDL Trados, MemoQ, Terminology Management",
        languages: [
          {language: "English", level: "Native"},
          {language: "Spanish", level: "Fluent (C2)"},
          {language: "French", level: "Fluent (C1)"},
          {language: "German", level: "Intermediate (B1)"}
        ],
        experience: [
          {
            title: "Senior Translator", 
            company: "GlobalTech Translations", 
            date: "2018 - Present",
            description: "Led translation projects for major tech clients, managing terminology databases and ensuring consistency across all materials."
          },
          {
            title: "Freelance Translator", 
            company: "Self-employed", 
            date: "2015 - 2018",
            description: "Provided translation services for various clients in technical, legal, and marketing fields."
          }
        ],
        education: [
          {
            degree: "Master's in Translation Studies", 
            institution: "University of Translation", 
            date: "2015",
            description: "Specialized in technical and scientific translation"
          }
        ],
        projects: formData.selectedProjects?.map(project => ({
          name: project.name,
          description: project.description || "",
          languagePair: `${project.sourceLanguage || "English"} → ${project.targetLanguage || "Various"}`
        })) || []
      };
      
      setCvContent(newCvContent);
      setResumeGenerated(true);
      setIsGenerating(false);
      setIsEditing(false);
      setIsEditingContent(false);
      
      toast({
        title: "CV generated!",
        description: "Your CV has been generated successfully",
      });
    }, 800); // Short delay to show loading state
  };
  
  const handleEditCV = () => {
    setIsEditing(true);
    // Keep the resume generated state true so the preview remains visible
    
    toast({
      title: "Editing CV",
      description: "You can now edit the CV details and regenerate when ready",
    });
  };
  
  const handleEditContent = () => {
    setIsEditingContent(true);
    
    toast({
      title: "Editing CV Content",
      description: "You can now edit the CV content in a user-friendly format",
    });
  };
  
  // Updates a specific CV content field
  const updateCvField = (field: string, value: any) => {
    setCvContent(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Add a new item to an array field
  const addCvItem = (field: 'languages' | 'experience' | 'education' | 'projects') => {
    setCvContent(prev => {
      const newItems = [...prev[field]];
      
      if (field === 'languages') {
        newItems.push({ language: "", level: "" });
      } else if (field === 'experience') {
        newItems.push({ title: "", company: "", date: "", description: "" });
      } else if (field === 'education') {
        newItems.push({ degree: "", institution: "", date: "", description: "" });
      } else if (field === 'projects') {
        newItems.push({ name: "", description: "", languagePair: "" });
      }
      
      return {
        ...prev,
        [field]: newItems
      };
    });
  };
  
  // Remove an item from an array field
  const removeCvItem = (field: 'languages' | 'experience' | 'education' | 'projects', index: number) => {
    setCvContent(prev => {
      const newItems = [...prev[field]];
      newItems.splice(index, 1);
      
      return {
        ...prev,
        [field]: newItems
      };
    });
  };
  
  // Update a specific property of an item in an array field
  const updateCvItemField = (
    field: 'languages' | 'experience' | 'education' | 'projects', 
    index: number, 
    property: string, 
    value: string
  ) => {
    setCvContent(prev => {
      const newItems = [...prev[field]];
      newItems[index] = {
        ...newItems[index],
        [property]: value
      };
      
      return {
        ...prev,
        [field]: newItems
      };
    });
  };
  
  // Save all changes and regenerate the HTML
  const saveContentChanges = () => {
    // Generate new HTML based on the structured content
    // This is a simplification; in a real app, you'd want to use a proper template engine
    const newHtml = `
    <div class="space-y-6 p-4">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold">${formData.name || "John Doe"}</h1>
        <h2 class="text-lg mt-1">${formData.jobTitle || "Professional Translator"}</h2>
        
        <!-- Contact Info -->
        <div class="text-sm mt-2">
          <p>${formData.email || "email@example.com"} • ${formData.phone || "+1 (555) 123-4567"} • ${formData.location || "City, Country"} • ${formData.website || "website.com"}</p>
        </div>
      </div>
  
      <!-- Summary Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Professional Summary</h3>
        <p class="text-sm">${cvContent.summary}</p>
      </div>
    
      <!-- Skills Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Skills</h3>
        <p class="text-sm">${cvContent.skills}</p>
      </div>
    
      <!-- Languages Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Languages</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          ${cvContent.languages.map(lang => `
            <div>
              <span class="font-semibold">${lang.language}:</span> ${lang.level}
            </div>
          `).join('')}
        </div>
      </div>
    
      <!-- Work Experience Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Work Experience</h3>
        ${cvContent.experience.map(exp => `
          <div class="mb-4">
            <h4 class="text-sm font-bold">${exp.title}</h4>
            <p class="text-sm">${exp.company}</p>
            <p class="text-sm">${exp.date}</p>
            <p class="text-sm mt-2">${exp.description}</p>
          </div>
        `).join('')}
      </div>
    
      <!-- Education Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Education</h3>
        ${cvContent.education.map(edu => `
          <div class="mb-4">
            <h4 class="text-sm font-bold">${edu.degree}</h4>
            <p class="text-sm">${edu.institution}</p>
            <p class="text-sm">${edu.date}</p>
            <p class="text-sm mt-2">${edu.description}</p>
          </div>
        `).join('')}
      </div>
    
      <!-- Projects Section -->
      <div>
        <h3 class="text-base font-bold border-b pb-1 mb-2">Projects</h3>
        ${cvContent.projects.map(proj => `
          <div class="mb-4">
            <h4 class="text-sm font-bold">${proj.name}</h4>
            <p class="text-sm mt-1">${proj.description}</p>
            <p class="text-sm">${proj.languagePair}</p>
          </div>
        `).join('')}
      </div>
    </div>
    `;
    
    setPreviewHtml(newHtml);
    setIsEditingContent(false);
    
    toast({
      title: "Changes Saved",
      description: "Your CV content has been updated",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetCompany">Target Company (Optional)</Label>
            <Input
              id="targetCompany"
              value={formData.targetCompany}
              onChange={(e) => updateField("targetCompany", e.target.value)}
              placeholder="Company you're applying to"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetPosition">Target Position</Label>
            <Input
              id="targetPosition"
              value={formData.targetPosition}
              onChange={(e) => updateField("targetPosition", e.target.value)}
              placeholder="Position you're applying for"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => updateField("jobDescription", e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            The job description helps tailor your resume to highlight relevant skills and experience
          </p>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={generateCV}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <span className="mr-2">Generating...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {isEditing ? "Update Preview" : "Generate CV"}
              </div>
            )}
          </Button>
        </div>
      </div>
      
      {resumeGenerated && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">CV Preview</h3>
            {isEditing && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                Editing Details
              </span>
            )}
            {isEditingContent && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Editing Content
              </span>
            )}
          </div>
          <Card className="border-green-200 overflow-hidden">
            {isEditingContent ? (
              <CardContent className="p-4 h-[500px] overflow-y-auto">
                <div className="space-y-6">
                  {/* Summary Section */}
                  <div>
                    <h3 className="text-base font-bold mb-2">Professional Summary</h3>
                    <Textarea 
                      value={cvContent.summary}
                      onChange={(e) => updateCvField('summary', e.target.value)}
                      className="w-full resize-none"
                      rows={3}
                    />
                  </div>
                  
                  {/* Skills Section */}
                  <div>
                    <h3 className="text-base font-bold mb-2">Skills</h3>
                    <Textarea 
                      value={cvContent.skills}
                      onChange={(e) => updateCvField('skills', e.target.value)}
                      className="w-full resize-none"
                      rows={2}
                      placeholder="List your skills separated by commas"
                    />
                  </div>
                  
                  {/* Languages Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold">Languages</h3>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addCvItem('languages')}
                      >
                        Add Language
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {cvContent.languages.map((lang, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input 
                            value={lang.language}
                            onChange={(e) => updateCvItemField('languages', index, 'language', e.target.value)}
                            placeholder="Language"
                            className="flex-1"
                          />
                          <Input 
                            value={lang.level}
                            onChange={(e) => updateCvItemField('languages', index, 'level', e.target.value)}
                            placeholder="Level"
                            className="flex-1"
                          />
                          <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => removeCvItem('languages', index)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Experience Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold">Work Experience</h3>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addCvItem('experience')}
                      >
                        Add Experience
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {cvContent.experience.map((exp, index) => (
                        <div key={index} className="border p-3 rounded">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">Experience {index + 1}</h4>
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeCvItem('experience', index)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div>
                              <Label htmlFor={`exp-title-${index}`}>Position/Title</Label>
                              <Input 
                                id={`exp-title-${index}`}
                                value={exp.title}
                                onChange={(e) => updateCvItemField('experience', index, 'title', e.target.value)}
                                placeholder="Job Title"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exp-company-${index}`}>Company</Label>
                              <Input 
                                id={`exp-company-${index}`}
                                value={exp.company}
                                onChange={(e) => updateCvItemField('experience', index, 'company', e.target.value)}
                                placeholder="Company Name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exp-date-${index}`}>Date</Label>
                              <Input 
                                id={`exp-date-${index}`}
                                value={exp.date}
                                onChange={(e) => updateCvItemField('experience', index, 'date', e.target.value)}
                                placeholder="e.g. 2018 - Present"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                              <Textarea 
                                id={`exp-desc-${index}`}
                                value={exp.description}
                                onChange={(e) => updateCvItemField('experience', index, 'description', e.target.value)}
                                placeholder="Describe your responsibilities and achievements"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Education Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold">Education</h3>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addCvItem('education')}
                      >
                        Add Education
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {cvContent.education.map((edu, index) => (
                        <div key={index} className="border p-3 rounded">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">Education {index + 1}</h4>
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeCvItem('education', index)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div>
                              <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                              <Input 
                                id={`edu-degree-${index}`}
                                value={edu.degree}
                                onChange={(e) => updateCvItemField('education', index, 'degree', e.target.value)}
                                placeholder="Degree or Certificate"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                              <Input 
                                id={`edu-institution-${index}`}
                                value={edu.institution}
                                onChange={(e) => updateCvItemField('education', index, 'institution', e.target.value)}
                                placeholder="School or University"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-date-${index}`}>Date</Label>
                              <Input 
                                id={`edu-date-${index}`}
                                value={edu.date}
                                onChange={(e) => updateCvItemField('education', index, 'date', e.target.value)}
                                placeholder="e.g. 2015"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-desc-${index}`}>Description</Label>
                              <Textarea 
                                id={`edu-desc-${index}`}
                                value={edu.description}
                                onChange={(e) => updateCvItemField('education', index, 'description', e.target.value)}
                                placeholder="Add any relevant details"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Projects Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-base font-bold">Projects</h3>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addCvItem('projects')}
                      >
                        Add Project
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {cvContent.projects.map((proj, index) => (
                        <div key={index} className="border p-3 rounded">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium">Project {index + 1}</h4>
                            <Button 
                              type="button" 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 text-red-500"
                              onClick={() => removeCvItem('projects', index)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div>
                              <Label htmlFor={`proj-name-${index}`}>Project Name</Label>
                              <Input 
                                id={`proj-name-${index}`}
                                value={proj.name}
                                onChange={(e) => updateCvItemField('projects', index, 'name', e.target.value)}
                                placeholder="Project Name"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`proj-desc-${index}`}>Description</Label>
                              <Textarea 
                                id={`proj-desc-${index}`}
                                value={proj.description}
                                onChange={(e) => updateCvItemField('projects', index, 'description', e.target.value)}
                                placeholder="Brief description of the project"
                                rows={2}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`proj-lang-${index}`}>Language Pair</Label>
                              <Input 
                                id={`proj-lang-${index}`}
                                value={proj.languagePair}
                                onChange={(e) => updateCvItemField('projects', index, 'languagePair', e.target.value)}
                                placeholder="e.g. English → Spanish"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-0 h-[300px] overflow-auto">
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </CardContent>
            )}
          </Card>
          <div className="flex justify-end">
            {isEditingContent ? (
              <Button 
                variant="outline" 
                className="text-green-600 mr-2"
                onClick={saveContentChanges}
              >
                Save Changes
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="text-blue-600 mr-2"
                onClick={handleEditContent}
              >
                Edit Content
              </Button>
            )}
            {!isEditingContent && (
              <Button 
                variant="outline" 
                className="text-purple-600 mr-2"
                onClick={handleEditCV}
              >
                Edit Details
              </Button>
            )}
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={nextStep}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {!formData.targetPosition.trim() && !resumeGenerated && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Target position needed</AlertTitle>
          <AlertDescription>
            Please enter a target position to generate your CV.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}