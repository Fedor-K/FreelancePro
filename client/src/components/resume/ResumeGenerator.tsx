import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertResumeSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { generateResume } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { FileText, Wand2, Settings, Copy, Download } from "lucide-react";
import { Link } from "wouter";
import { getResumeSettings } from "@/lib/settingsService";
import { ProjectsSelector } from "./ProjectsSelector";
import { apiRequest } from "@/lib/queryClient";

// Extend the schema with validation
const formSchema = z.object({
  // Original required fields
  name: z.string().default(""),         // Will be set from settings
  specialization: z.string().default(""), // Will be set from settings
  experience: z.string().default(""),     // Will be set from settings
  projects: z.string().min(10, { message: "Projects must be at least 10 characters" }),
  
  // Our new field
  targetProject: z.string().min(10, { message: "Target project description must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ResumeGeneratorProps {
  resumeToEdit?: {
    id: number;
    name: string;
    specialization: string;
    experience: string;
    projects: string;
    content: string;
  } | null;
  previewOnly?: boolean;
  onEditComplete?: () => void;
  onPreviewGenerated?: (content: string, data: any) => void;
}

export function ResumeGenerator({ 
  resumeToEdit = null, 
  previewOnly = false, 
  onEditComplete,
  onPreviewGenerated
}: ResumeGeneratorProps) {
  // For debugging - track component instance
  const instanceId = useRef(Math.random().toString(36).substring(7)).current;
  console.log(`[ResumeGenerator:${instanceId}] Constructor called with resumeToEdit:`, 
    resumeToEdit ? {id: resumeToEdit.id, name: resumeToEdit.name, hasContent: !!resumeToEdit.content} : null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  // Initialize content from props or localStorage
  const [resumeContent, setResumeContent] = useState<string | null>(() => {
    if (resumeToEdit?.content) {
      return resumeToEdit.content;
    }
    // Try to retrieve from localStorage if no direct content provided
    try {
      const savedContent = localStorage.getItem('lastGeneratedResume');
      return savedContent;
    } catch (e) {
      return null;
    }
  });
  const [isEditing] = useState(!!resumeToEdit);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specialization: "",
      experience: "",
      projects: "",
      targetProject: "",
    },
  });
  
  // Load resume settings or edited resume data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Clear form first
        form.reset();
        
        if (resumeToEdit) {
          console.log(`[ResumeGenerator:${instanceId}] Loading data for editing resume:`, resumeToEdit.id);
          
          // Set form values from the resume being edited
          form.setValue("name", resumeToEdit.name || "");
          form.setValue("specialization", resumeToEdit.specialization || "");
          form.setValue("experience", resumeToEdit.experience || "");
          form.setValue("projects", resumeToEdit.projects || "");
          
          // Try to extract target project from the content or experience
          const targetProjectMatch = resumeToEdit.experience?.match(/NOTE: This resume is specifically tailored for the following job\/project: (.+?)(\n|$)/);
          if (targetProjectMatch && targetProjectMatch[1]) {
            console.log(`[ResumeGenerator:${instanceId}] Found target project:`, targetProjectMatch[1]);
            form.setValue("targetProject", targetProjectMatch[1]);
          } else {
            // Set a default value
            form.setValue("targetProject", "Please describe the project you're applying to");
          }
          
          // Set resume content immediately
          setResumeContent(resumeToEdit.content);
          
          // Store current edited resume in localStorage
          localStorage.setItem('lastGeneratedResume', resumeToEdit.content);
        } else {
          // Load from settings for new resume
          console.log(`[ResumeGenerator:${instanceId}] Loading settings for new resume`);
          
          // If we're creating a new resume (not editing), clear any previous cached resume
          if (!isEditing && !resumeToEdit) {
            localStorage.removeItem('lastGeneratedResume');
          }
          
          const settings = await getResumeSettings();
          
          // Set form values from settings
          form.setValue("name", settings.defaultTitle || "Professional Resume");
          form.setValue("specialization", settings.skills.split(',')[0] || "Translator");
          
          // Create a formatted experience string from the settings
          const formattedExperience = `${settings.experience}\n\nLanguages: ${settings.languages}\n\nEducation: ${settings.education}`;
          form.setValue("experience", formattedExperience);
          
          // Set projects if available
          form.setValue("projects", settings.projects || "");
        }
        
        // Trigger validation
        form.trigger();
      } catch (error) {
        console.error(`[ResumeGenerator:${instanceId}] Error loading data:`, error);
        toast({
          title: "Error loading data",
          description: "Failed to load resume data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadData();
    
    return () => {
      console.log(`[ResumeGenerator:${instanceId}] Component unmounting, resumeToEdit:`, 
        resumeToEdit ? resumeToEdit.id : null);
    };
  }, [form, resumeToEdit, toast, instanceId]);
  
  // Generate resume content without saving to database
  const generateResumeContent = async (data: FormValues) => {
    try {
      setIsGenerating(true);
      console.log(`[ResumeGenerator:${instanceId}] Generating resume content`);
      
      // Add the target project information to the experience field
      let updatedExperience = data.experience;
      updatedExperience = updatedExperience.replace(/NOTE: This resume is specifically tailored for the following job\/project:.+?(\n|$)/, '');
      updatedExperience += `\n\nNOTE: This resume is specifically tailored for the following job/project: ${data.targetProject}`;
      
      const payload = {
        // Basic fields
        name: data.name,
        specialization: data.specialization,
        experience: updatedExperience,
        projects: data.projects,
        targetProject: data.targetProject,
        useAdditionalSettings: true,
      };
      
      // Generate resume
      console.log(`[ResumeGenerator:${instanceId}] Generating resume with payload:`, {
        ...payload,
        experience: updatedExperience.substring(0, 50) + "...",
      });
      
      const generatedResume = await generateResume(payload);
      
      // Update UI with result
      setResumeContent(generatedResume.content);
      
      // Store the generated resume in localStorage for persistence
      localStorage.setItem('lastGeneratedResume', generatedResume.content);
      
      toast({
        title: "Resume preview generated",
        description: "You can now review your resume before saving it.",
        duration: 3000,
      });
      
      return {
        content: generatedResume.content,
        updatedExperience
      };
    } catch (error) {
      console.error(`[ResumeGenerator:${instanceId}] Error generating resume:`, error);
      toast({
        title: "Error generating resume",
        description: "Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Form submission - generate the resume content
  const onSubmit = async (data: FormValues) => {
    console.log(`[ResumeGenerator:${instanceId}] onSubmit called with previewOnly=${previewOnly}`);
    
    try {
      setIsGenerating(true);
      
      // Add the target project information to the experience field
      let updatedExperience = data.experience;
      updatedExperience = updatedExperience.replace(/NOTE: This resume is specifically tailored for the following job\/project:.+?(\n|$)/, '');
      updatedExperience += `\n\nNOTE: This resume is specifically tailored for the following job/project: ${data.targetProject}`;
      
      const payload = {
        // Basic fields
        name: data.name,
        specialization: data.specialization,
        experience: updatedExperience,
        projects: data.projects,
        targetProject: data.targetProject,
        useAdditionalSettings: true,
      };
      
      if (previewOnly && onPreviewGenerated) {
        // Generate resume but don't save to database
        console.log(`[ResumeGenerator:${instanceId}] Generating preview only`);
        const generatedResume = await generateResume(payload);
        
        // For preview mode, notify parent component instead of updating local state
        onPreviewGenerated(generatedResume.content, payload);
        
        toast({
          title: "Resume preview generated",
          description: "You can now review your resume before saving it.",
          duration: 3000,
        });
      } else {
        // Regular flow - generate and update local state
        console.log(`[ResumeGenerator:${instanceId}] Generating full resume`);
        
        // Add ID if editing
        if (isEditing && resumeToEdit) {
          Object.assign(payload, { id: resumeToEdit.id, isEditing: true });
        }
        
        const generatedResume = await generateResume(payload);
        
        // Update UI with result
        setResumeContent(generatedResume.content);
        
        // Store the generated resume in localStorage for persistence
        localStorage.setItem('lastGeneratedResume', generatedResume.content);
        
        // Call onEditComplete callback
        if (onEditComplete) {
          onEditComplete();
        }
        
        toast({
          title: isEditing ? "Resume updated" : "Resume generated",
          description: isEditing 
            ? "Your resume has been updated successfully."
            : "Your resume has been generated successfully.",
        });
      }
    } catch (error) {
      console.error(`[ResumeGenerator:${instanceId}] Error generating resume:`, error);
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }
  
  // No longer needed as we're handling saving at the parent level
  
  const handleCopyToClipboard = () => {
    if (resumeContent) {
      navigator.clipboard.writeText(resumeContent);
      toast({
        title: "Copied to clipboard",
        description: "Resume content has been copied to clipboard.",
      });
    }
  };
  
  const handleDownload = () => {
    if (resumeContent) {
      const element = document.createElement("a");
      const file = new Blob([resumeContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      
      // Use the name from form or fallback to 'professional-resume'
      const resumeName = form.getValues("name") || "professional-resume";
      element.download = `resume-${resumeName.toLowerCase().replace(/\s+/g, "-")}.txt`;
      
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <div className="mr-4 p-3 bg-purple-100 rounded-md">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {isEditing ? "Edit Resume" : "Resume Generator"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing 
                ? `Editing resume: ${resumeToEdit?.name}`
                : "Create a professional resume tailored for your freelance specialty."
              }
            </p>
          </div>
        </div>
        
        {/* Two main sections - Content preview (if available) and Form */}
        <div className="space-y-6">
          {/* Resume Content Preview - Only shown when content exists and not in previewOnly mode */}
          {resumeContent && !previewOnly && (
            <div id="resume-preview-section" className="mb-4">
              <h4 className="text-base font-medium mb-2">Resume Preview</h4>
              <div className="p-4 border rounded-md whitespace-pre-wrap font-mono text-sm max-h-80 overflow-y-auto">
                {resumeContent}
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {/* Form for editing or creating resume */}
          <div className="mb-4">
            {!isEditing && (
              <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  This form is pre-populated from your resume settings
                </p>
                <Link href="/settings">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center text-xs"
                  >
                    <Settings className="mr-1 h-3 w-3" />
                    Edit Settings
                  </Button>
                </Link>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="targetProject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project you apply to</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please give a brief description of the project you would like to apply to"
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the specific job or project you are targeting with this resume
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notable Projects</FormLabel>
                      <div className="mb-2">
                        <ProjectsSelector 
                          selectedProjects={field.value.split('\n').filter(line => line.trim())} 
                          onProjectsChange={(projects) => {
                            field.onChange(projects.join('\n'));
                          }}
                        />
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder="List your most notable freelance projects or achievements"
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Select from your existing projects or manually add project details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full mt-2 bg-accent hover:bg-accent/90"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isGenerating 
                    ? isEditing ? "Updating Resume..." : "Generating Resume..." 
                    : isEditing ? "Update Resume" : (previewOnly ? "Generate Preview" : "Generate Resume")
                  }
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}