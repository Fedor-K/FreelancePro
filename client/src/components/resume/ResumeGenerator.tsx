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
const formSchema = insertResumeSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  specialization: z.string().min(2, { message: "Specialization must be at least 2 characters" }),
  experience: z.string().min(10, { message: "Experience must be at least 10 characters" }),
  projects: z.string().min(10, { message: "Projects must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resume, setResume] = useState<{ id: number; content: string } | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      specialization: "",
      experience: "",
      projects: "",
    },
  });
  
  // Load resume settings from settings service
  useEffect(() => {
    const loadResumeSettings = async () => {
      try {
        const settings = await getResumeSettings();
        
        // Only update the form if it's empty (to avoid overwriting user input)
        const currentExperience = form.getValues("experience");
        if (!currentExperience) {
          // Pre-populate form with settings
          form.setValue("name", settings.defaultTitle);
          form.setValue("specialization", settings.skills.split(',')[0] || "Translator");
          
          // Create a formatted experience string from the settings
          const formattedExperience = `${settings.experience}\n\nLanguages: ${settings.languages}\n\nEducation: ${settings.education}`;
          form.setValue("experience", formattedExperience);
          
          // Pre-populate projects from settings
          form.setValue("projects", settings.projects || "")
        }
      } catch (error) {
        console.error("Failed to load resume settings:", error);
      }
    };
    
    loadResumeSettings();
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      // Pass useAdditionalSettings: true to enhance the resume with settings data
      const generatedResume = await generateResume({
        ...data,
        useAdditionalSettings: true
      });
      
      setResume(generatedResume);
      setActiveTab("preview");
      
      toast({
        title: "Resume generated",
        description: "Your professional resume has been generated using your settings preferences.",
      });
    } catch (error) {
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
      element.download = `resume-${form.getValues("name").toLowerCase().replace(/\s+/g, "-")}.txt`;
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Translator, Copywriter, Editor" {...field} />
                      </FormControl>
                      <FormDescription>Your main freelance profession or specialty</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Experience</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your past work experience, skills, and education"
                          rows={5} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include years of experience, skills, education, and any relevant certifications
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
