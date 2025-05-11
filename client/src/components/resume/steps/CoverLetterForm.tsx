import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Download, Save, RefreshCw, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCoverLetterPreviewHTML } from "@/lib/resumeTemplate";

interface CoverLetterFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function CoverLetterForm({ formData, updateField }: CoverLetterFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [coverLetterGenerated, setCoverLetterGenerated] = useState(false);
  const [formTab, setFormTab] = useState<"edit" | "preview">("edit");
  
  // Handle cover letter generation
  const generateCoverLetter = async () => {
    setIsGenerating(true);
    
    try {
      // Here we would normally make an API request to use OpenAI
      // For now, we'll simulate the process with a timeout
      setTimeout(() => {
        // Simulate a generated cover letter
        const generatedLetter = `
Dear Hiring Manager,

I am writing to express my interest in the ${formData.targetCompany ? `position at ${formData.targetCompany}` : "position you've advertised"}. As a professional with extensive experience in translation and localization, I am confident in my ability to contribute effectively to your team.

${formData.jobDescription ? "Based on the job description, I understand you're looking for someone who can handle complex translation projects while maintaining high quality standards. " : ""}With my background in managing multiple translation projects and expertise in ${formData.selectedProjects.length > 0 ? `projects like ${formData.selectedProjects[0]?.name}` : "various translation projects"}, I am well-equipped to meet these requirements.

${formData.skills.length > 0 ? `My skills in ${formData.skills.slice(0, 3).join(", ")} align perfectly with what you're seeking. ` : ""}I am particularly proud of my ability to maintain the integrity and nuance of source material while adapting content for target audiences.

I look forward to the opportunity to discuss how my qualifications can benefit your organization. Thank you for considering my application.

Sincerely,
${formData.name || "Your Name"}
        `.trim();
        
        updateField("coverLetter", generatedLetter);
        
        toast({
          title: "Cover letter generated!",
          description: "Your cover letter has been created based on your resume and the job description",
        });
        
        setCoverLetterGenerated(true);
        setShowPreview(true);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your cover letter. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };
  
  // Handle cover letter save
  const saveCoverLetter = () => {
    toast({
      title: "Cover letter saved",
      description: "Your cover letter has been saved successfully",
    });
  };
  
  // Handle cover letter download
  const downloadCoverLetter = () => {
    if (!formData.coverLetter) {
      toast({
        title: "No content",
        description: "Please generate or write a cover letter first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Download started",
      description: "Your cover letter is being prepared for download",
    });
    
    try {
      // Import the downloadCoverLetter function from our template
      import('@/lib/resumeTemplate').then((module) => {
        module.downloadCoverLetter(formData);
        
        toast({
          title: "Cover letter downloaded",
          description: "Your cover letter has been downloaded as a PDF file",
        });
      }).catch(error => {
        throw error;
      });
    } catch (error) {
      console.error("Error downloading cover letter:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your cover letter. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle cover letter copy
  const copyCoverLetter = () => {
    navigator.clipboard.writeText(formData.coverLetter || "");
    toast({
      title: "Copied to clipboard",
      description: "Your cover letter has been copied to the clipboard",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Cover Letter</h2>
        <p className="text-sm text-muted-foreground">
          Create a matching cover letter to accompany your resume
        </p>
      </div>
      
      <Tabs defaultValue={showPreview ? "preview" : "generate"} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" onClick={() => setShowPreview(false)}>Generate</TabsTrigger>
          <TabsTrigger 
            value="preview" 
            onClick={() => setShowPreview(true)}
            disabled={!formData.coverLetter}
          >
            Preview & Edit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Cover Letter Generation
              </CardTitle>
              <CardDescription>
                Generate a personalized cover letter based on your resume and target position
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="match-job">Match Job Description</Label>
                  <p className="text-xs text-muted-foreground">Address specific requirements in the job posting</p>
                </div>
                <Switch id="match-job" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlight-skills">Highlight Key Skills</Label>
                  <p className="text-xs text-muted-foreground">Emphasize skills most relevant to the position</p>
                </div>
                <Switch id="highlight-skills" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="formal-tone">Formal Tone</Label>
                  <p className="text-xs text-muted-foreground">Use professional business letter format</p>
                </div>
                <Switch id="formal-tone" defaultChecked />
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="tone-selection">Writing Style</Label>
                <Select defaultValue="professional">
                  <SelectTrigger id="tone-selection">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full"
                onClick={generateCoverLetter}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <span className="mr-2">Generating...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {coverLetterGenerated ? "Regenerate Cover Letter" : "Generate Cover Letter"}
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="text-sm text-center text-muted-foreground">
            <p>Your cover letter will be customized based on your resume and target job description</p>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left side - controls */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Cover Letter Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="edit-mode">Edit Mode</Label>
                    <Tabs value={formTab} onValueChange={(v) => setFormTab(v as "edit" | "preview")} className="w-[120px]">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">View</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <Button 
                    className="w-full justify-start"
                    onClick={() => generateCoverLetter()}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    onClick={saveCoverLetter}
                    variant="outline"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Cover Letter
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    onClick={downloadCoverLetter}
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    onClick={copyCoverLetter}
                    variant="outline"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Right side - cover letter preview & editor */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-2 border-b">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>Cover Letter</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-xs" 
                      onClick={() => setShowPreview(false)}
                    >
                      Edit Settings
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {formTab === "edit" ? (
                    <Textarea
                      value={formData.coverLetter || ""}
                      onChange={(e) => updateField("coverLetter", e.target.value)}
                      className="min-h-[500px] rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none font-serif"
                      placeholder="Your cover letter will appear here. You can edit it directly."
                    />
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="p-0 flex-1 min-h-[500px]">
                        <iframe
                          srcDoc={`
                            <html>
                              <head>
                                <style>
                                  body {
                                    font-family: Georgia, 'Times New Roman', serif;
                                    line-height: 1.6;
                                    color: #333;
                                    margin: 0;
                                    padding: 1.5rem;
                                    background-color: white;
                                  }
                                  p { margin: 0.5rem 0; }
                                  .letter-heading { text-align: right; margin-bottom: 2rem; }
                                  .sender-info { margin-bottom: 2rem; }
                                  .recipient-info { margin-bottom: 2rem; }
                                  .salutation { margin-bottom: 1rem; }
                                  .content { margin-bottom: 2rem; white-space: pre-line; }
                                  .closing { margin-bottom: 0.5rem; }
                                  .signature { margin-top: 2rem; }
                                </style>
                              </head>
                              <body>
                                ${createCoverLetterPreviewHTML(formData)}
                              </body>
                            </html>
                          `}
                          style={{ width: '100%', height: '100%', border: 'none', minHeight: '500px' }}
                          title="Cover Letter Preview"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}