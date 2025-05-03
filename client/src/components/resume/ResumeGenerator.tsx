import { useState } from "react";
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
import { FileText, Wand2 } from "lucide-react";

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

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      const generatedResume = await generateResume(data);
      
      setResume(generatedResume);
      setActiveTab("preview");
      
      toast({
        title: "Resume generated",
        description: "Your professional resume has been generated successfully.",
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
              Create a professional resume tailored for your freelance specialty. AI-powered to highlight your best skills.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="form">Information</TabsTrigger>
            <TabsTrigger value="preview" disabled={!resume}>Resume Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
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
                      <FormControl>
                        <Textarea 
                          placeholder="List your most notable freelance projects or achievements"
                          rows={5} 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include client names (if allowed), project scope, and your specific contributions
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
