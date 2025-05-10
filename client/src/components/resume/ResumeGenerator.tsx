import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateResume } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { FileText, Wand2, Settings } from "lucide-react";
import { Link } from "wouter";
import { getResumeSettings } from "@/lib/settingsService";
import { ProjectsSelector } from "./ProjectsSelector";

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
  onEditComplete?: () => void;
}

export function ResumeGenerator({ resumeToEdit = null, onEditComplete }: ResumeGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<{ id: number; content: string } | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const [isEditing, setIsEditing] = useState(!!resumeToEdit);
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
  
  // Load resume settings from settings service
  useEffect(() => {
    const loadResumeData = async () => {
      try {
        // If we're editing an existing resume, use its data
        if (resumeToEdit) {
          // Set form values from the resume being edited
          form.setValue("name", resumeToEdit.name);
          form.setValue("specialization", resumeToEdit.specialization);
          form.setValue("experience", resumeToEdit.experience);
          form.setValue("projects", resumeToEdit.projects);
          
          // Try to extract target project from the content or experience
          const targetProjectMatch = resumeToEdit.experience.match(/NOTE: This resume is specifically tailored for the following job\/project: (.+?)(\n|$)/);
          if (targetProjectMatch && targetProjectMatch[1]) {
            form.setValue("targetProject", targetProjectMatch[1]);
          } else {
            // Set a default value or try to find it in the content
            form.setValue("targetProject", "Please describe the project you're applying to");
          }
          
          // Set the resume preview
          setResume(resumeToEdit);
        } else {
          // Otherwise, load from settings
          const settings = await getResumeSettings();
          
          // Set the required fields from settings (these are hidden from the user)
          form.setValue("name", settings.defaultTitle || "Professional Resume");
          form.setValue("specialization", settings.skills.split(',')[0] || "Translator");
          
          // Create a formatted experience string from the settings
          const formattedExperience = `${settings.experience}\n\nLanguages: ${settings.languages}\n\nEducation: ${settings.education}`;
          form.setValue("experience", formattedExperience);
          
          // Only update projects if it's empty (to avoid overwriting user input)
          const currentProjects = form.getValues("projects");
          if (!currentProjects) {
            form.setValue("projects", settings.projects || "");
          }
        }
      } catch (error) {
        console.error("Failed to load resume data:", error);
      }
    };
    
    loadResumeData();
  }, [form, resumeToEdit]);

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      let generatedResume;
      
      if (isEditing && resumeToEdit) {
        // If we're editing an existing resume, just update the targetProject
        // and regenerate the resume content
        
        // Add the target project information to the experience field
        let updatedExperience = data.experience;
        
        // Remove any existing target project note if present
        updatedExperience = updatedExperience.replace(/NOTE: This resume is specifically tailored for the following job\/project:.+?(\n|$)/, '');
        
        // Add the new target project note
        updatedExperience += `\n\nNOTE: This resume is specifically tailored for the following job/project: ${data.targetProject}`;
        
        // Generate updated resume
        generatedResume = await generateResume({
          // Keep the original ID
          id: resumeToEdit.id,
          
          // Use form data with enhanced experience
          name: data.name,
          specialization: data.specialization,
          experience: updatedExperience,
          projects: data.projects,
          
          // Target project for tailoring
          targetProject: data.targetProject,
          
          // We're updating an existing resume
          isEditing: true,
          
          // Tell the API to use additional settings if needed
          useAdditionalSettings: true
        });
        
        // Notify edit completion if callback provided
        if (onEditComplete) {
          onEditComplete();
        }
        
        toast({
          title: "Resume updated",
          description: "Your resume has been updated and tailored for your target project.",
        });
      } else {
        // Creating a new resume
        generatedResume = await generateResume({
          // Basic required fields for the API
          name: data.name,
          specialization: data.specialization,
          experience: data.experience,
          projects: data.projects,
          
          // Our additional field that will be used for tailoring
          targetProject: data.targetProject,
          
          // Tell the API to use additional settings if needed
          useAdditionalSettings: true
        });
        
        toast({
          title: "Resume generated",
          description: "Your resume has been tailored for your target project using your resume settings.",
        });
      }
      
      setResume(generatedResume);
      setActiveTab("preview");
      
    } catch (error) {
      console.error("Resume generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (resume?.content) {
      navigator.clipboard.writeText(resume.content);
      toast({
        title: "Copied to clipboard",
        description: "Resume content has been copied to clipboard.",
      });
    }
  };

  const handleDownload = () => {
    if (resume?.content) {
      const element = document.createElement("a");
      const file = new Blob([resume.content], { type: "text/plain" });
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Resume Generator</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a professional resume tailored for your freelance specialty. Pre-populated with your Resume settings and AI-powered to highlight your best skills.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="form">Information</TabsTrigger>
            <TabsTrigger value="preview" disabled={!resume}>Resume Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                This form is pre-populated from your resume settings
              </p>
              <Link href="/settings">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center text-xs"
                  onClick={() => {}}
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Edit Resume Settings
                </Button>
              </Link>
            </div>
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
                  {isGenerating ? "Generating Resume..." : "Generate Resume"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            {resume && (
              <div>
                <div className="p-6 bg-white border rounded-md whitespace-pre-wrap font-mono text-sm">
                  {resume.content}
                </div>
                <div className="flex justify-end mt-4 space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCopyToClipboard}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleDownload}>
                    Download Resume
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
