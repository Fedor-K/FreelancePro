import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Save, Copy, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createResumePreviewHTML, downloadResume } from "@/lib/resumeTemplate";

interface PreviewExportFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function PreviewExportForm({ formData, updateField }: PreviewExportFormProps) {
  const { toast } = useToast();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [resumeName, setResumeName] = useState(`Resume - ${new Date().toLocaleDateString()}`);
  
  // Handle resume template change
  const handleTemplateChange = (value: string) => {
    updateField("template", value);
  };
  
  // Handle resume save
  const handleSaveResume = () => {
    // In a real implementation, we would save the resume to the database
    toast({
      title: "Resume saved",
      description: "Your resume has been saved successfully",
    });
  };
  
  // Handle resume download
  const handleDownloadResume = () => {
    toast({
      title: "Download started",
      description: "Your resume is being prepared for download",
    });
    
    try {
      // Use the shared template function for downloading
      downloadResume(formData, resumeName);
      
      toast({
        title: "Resume Downloaded",
        description: "Your resume has been downloaded as a PDF file.",
      });
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle resume copy to clipboard
  const handleCopyResume = () => {
    // In a real implementation, we would copy the resume content to clipboard
    toast({
      title: "Copied to clipboard",
      description: "Your resume content has been copied to clipboard",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Preview & Export</h2>
        <p className="text-sm text-muted-foreground">
          Review your resume, make final adjustments, and export it
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side - controls */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resume Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-name">Resume Name</Label>
                <Input
                  id="resume-name"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  placeholder="Enter a name for your resume"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={formData.template} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 space-y-2">
                <Button 
                  className="w-full justify-start"
                  onClick={() => setIsEditingMode(!isEditingMode)}
                  variant="outline"
                >
                  {isEditingMode ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Mode
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Mode
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleSaveResume}
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Resume
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleDownloadResume}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleCopyResume}
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resume Sections</CardTitle>
              <CardDescription>
                Toggle sections to show or hide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-summary" className="rounded" defaultChecked />
                  <Label htmlFor="show-summary">Professional Summary</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-skills" className="rounded" defaultChecked />
                  <Label htmlFor="show-skills">Skills</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-experience" className="rounded" defaultChecked />
                  <Label htmlFor="show-experience">Work Experience</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-projects" className="rounded" defaultChecked />
                  <Label htmlFor="show-projects">Projects</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-education" className="rounded" defaultChecked />
                  <Label htmlFor="show-education">Education</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-languages" className="rounded" defaultChecked />
                  <Label htmlFor="show-languages">Languages</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - resume preview */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Resume Preview</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Template: {formData.template.charAt(0).toUpperCase() + formData.template.slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] overflow-auto p-0">
              {/* Use our shared template function for consistent preview */}
              <iframe
                srcDoc={`
                  <html>
                    <head>
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          line-height: 1.6;
                          color: #333;
                          margin: 0;
                          padding: 1rem;
                        }
                        h1, h2, h3, h4 {
                          margin-top: 0;
                          color: #2B6CB0;
                        }
                        h1 { font-size: 24px; text-align: center; margin-bottom: 0.5rem; }
                        h2 { font-size: 18px; text-align: center; font-weight: normal; margin-bottom: 1rem; }
                        h3 { font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; margin-top: 1.5rem; }
                        p { margin: 0.5rem 0; }
                        ul { padding-left: 1.5rem; }
                        .contact-info { text-align: center; margin-bottom: 1.5rem; font-size: 14px; }
                        .job-title { font-weight: bold; margin-bottom: 0; }
                        .company { margin-bottom: 0; }
                        .dates { font-style: italic; margin-bottom: 0.5rem; font-size: 14px; }
                        .section { margin-bottom: 1.5rem; }
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                        .language-item { margin-bottom: 0.5rem; }
                        .language-name { font-weight: bold; }
                      </style>
                    </head>
                    <body>
                      ${createResumePreviewHTML(formData)}
                    </body>
                  </html>
                `}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Resume Preview"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}