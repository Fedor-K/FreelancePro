import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Download, Save, FileText, ClipboardCopy, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  createResumePreviewHTML, 
  downloadResume, 
  createCoverLetterPreviewHTML,
  downloadCoverLetter
} from "@/lib/resumeTemplate";

interface PreviewExportFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function PreviewExportForm({ formData, updateField }: PreviewExportFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("resume");
  const [resumeName, setResumeName] = useState(`Resume - ${formData.targetPosition || "General"}`);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Handle download
  const handleDownload = () => {
    if (activeTab === "resume") {
      downloadResume(formData, resumeName);
      toast({
        title: "Resume downloaded",
        description: "Your resume has been downloaded as a PDF file",
      });
    } else {
      downloadCoverLetter(formData);
      toast({
        title: "Cover letter downloaded",
        description: "Your cover letter has been downloaded as a PDF file",
      });
    }
  };
  
  // Handle save
  const handleSave = () => {
    // Here we would send the resume to the server for saving
    // For now, just simulate with a timeout
    setTimeout(() => {
      toast({
        title: "Resume saved",
        description: "Your resume has been saved to your account",
      });
      setIsSaved(true);
      
      // Reset after some time
      setTimeout(() => setIsSaved(false), 3000);
    }, 500);
  };
  
  // Handle copy
  const handleCopy = () => {
    let contentToCopy = "";
    
    if (activeTab === "resume") {
      contentToCopy = formData.summary;
    } else {
      contentToCopy = formData.coverLetter;
    }
    
    navigator.clipboard.writeText(contentToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: activeTab === "resume" ? "Resume content copied" : "Cover letter copied",
      });
      setIsCopied(true);
      
      // Reset after some time
      setTimeout(() => setIsCopied(false), 3000);
    }).catch(() => {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Preview & Export</h2>
        <p className="text-sm text-muted-foreground">
          Preview your documents and export them in various formats
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resume" className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resumeName">Resume File Name</Label>
              <Input
                id="resumeName"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="Enter file name for your resume"
              />
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resume Preview</CardTitle>
                <CardDescription>
                  Preview how your resume will look when exported
                </CardDescription>
              </CardHeader>
              
              <CardContent className="border-t pt-4">
                <div className="relative">
                  {formData.selectedProjects && formData.selectedProjects.length > 0 ? (
                    <iframe
                      title="Resume Preview"
                      srcDoc={createResumePreviewHTML(formData)}
                      className="w-full h-[40rem] border rounded"
                      style={{ backgroundColor: "white" }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[40rem] border rounded bg-gray-50">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No projects selected</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Please select at least one project in the Resume Building step
                        to generate your resume preview.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button onClick={handleSave} variant="outline" className="flex-1">
                  {isSaved ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save to Account
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="coverLetter" className="space-y-6 pt-4">
          {!formData.coverLetter ? (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No cover letter content</AlertTitle>
              <AlertDescription>
                Please go back to the Cover Letter step to create content before previewing.
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cover Letter Preview</CardTitle>
                <CardDescription>
                  Preview how your cover letter will look when exported
                </CardDescription>
              </CardHeader>
              
              <CardContent className="border-t pt-4">
                <div className="relative">
                  <iframe
                    title="Cover Letter Preview"
                    srcDoc={createCoverLetterPreviewHTML(formData)}
                    className="w-full h-[40rem] border rounded"
                    style={{ backgroundColor: "white" }}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  {isCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="mr-2 h-4 w-4" />
                      Copy Text
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <Alert className="bg-blue-50 border-blue-200">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Ready to export</AlertTitle>
        <AlertDescription className="text-blue-700">
          Your documents are ready for download. You can also save them to your account for future access.
        </AlertDescription>
      </Alert>
    </div>
  );
}