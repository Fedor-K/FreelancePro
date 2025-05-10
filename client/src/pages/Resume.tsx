import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResumeGenerator } from "@/components/resume/ResumeGenerator";
import { CoverLetterGenerator } from "@/components/resume/CoverLetterGenerator";
import { Resume as ResumeType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function Resume() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeType | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [documentType, setDocumentType] = useState<"resume" | "coverLetter">("resume");
  const [isEditing, setIsEditing] = useState(false);
  
  // New state for two-step resume generation
  const [currentResumeContent, setCurrentResumeContent] = useState<string | null>(null);
  const [currentResumeData, setCurrentResumeData] = useState<any>({
    name: "",
    specialization: "",
    experience: "",
    projects: "",
    targetProject: ""
  });
  
  const { data: resumes = [], isLoading, refetch } = useQuery<ResumeType[]>({
    queryKey: ['/api/resumes'],
  });

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Resume content has been copied to clipboard.",
    });
  };

  const handleDownload = (resume: ResumeType) => {
    const element = document.createElement("a");
    const file = new Blob([resume.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `resume-${resume.name.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/resumes/${resumeToDelete.id}`, undefined);
      
      await refetch();
      setIsDeleteDialogOpen(false);
      setResumeToDelete(null);
      
      toast({
        title: "Resume deleted",
        description: "Resume has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle preview generation
  const handlePreviewGenerated = (content: string, data: any) => {
    console.log("Preview generated with data:", { 
      content: content.substring(0, 30) + "...",
      dataId: data.id,
      isEditing,
      currentId: currentResumeData?.id
    });
    
    setCurrentResumeContent(content);
    
    // If we're editing, make sure to preserve the resume ID
    if (isEditing && currentResumeData?.id) {
      setCurrentResumeData({
        ...data,
        id: currentResumeData.id
      });
    } else {
      setCurrentResumeData(data);
    }
  };
  
  // Function to save the resume to the database
  const handleSaveResume = async () => {
    console.log("handleSaveResume called with data:", { 
      hasContent: !!currentResumeContent,
      currentResumeData
    });
    
    if (!currentResumeContent || !currentResumeData) {
      toast({
        title: "No content to save",
        description: "Please generate a resume first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create payload with content
      const payload = {
        ...currentResumeData,
        content: currentResumeContent
      };
      
      // Check if we're updating an existing resume
      const isEditing = payload.id !== undefined;
      console.log("Save payload:", payload);
      console.log("isEditing:", isEditing, "Resume ID:", payload.id);
      
      // Save/update resume
      if (isEditing) {
        console.log('Updating existing resume:', payload.id);
        await apiRequest("PATCH", `/api/resumes/${payload.id}`, payload);
      } else {
        console.log('Creating new resume');
        await apiRequest("POST", '/api/resumes', payload);
      }
      
      // Refresh the list
      await refetch();
      
      // Show success notification
      toast({
        title: isEditing ? "Resume updated" : "Resume saved",
        description: isEditing 
          ? "Your resume has been updated successfully." 
          : "Your resume has been saved to your collection.",
      });
      
      // Switch to saved tab
      setActiveTab("saved");
      
      // Reset the state for next resume creation
      setCurrentResumeContent(null);
      setCurrentResumeData({
        name: "",
        specialization: "",
        experience: "",
        projects: "",
        targetProject: ""
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Generator</CardTitle>
          <CardDescription>
            Create professional resumes and cover letters powered by AI to help you land your next freelance client.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="create">Create Document</TabsTrigger>
          <TabsTrigger value="saved">Saved Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <div className="mb-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Document Type
              </label>
              <Select 
                value={documentType} 
                onValueChange={(value) => setDocumentType(value as "resume" | "coverLetter")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="coverLetter">Cover Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {documentType === "resume" && (
            <>
              {/* Step 1: Show resume form if no content is generated yet */}
              {!currentResumeContent && (
                <ResumeGenerator 
                  previewOnly={true}
                  initialFormValues={currentResumeData} // Pass the saved form data back
                  resumeToEdit={currentResumeData?.id ? {
                    id: currentResumeData.id,
                    name: currentResumeData.name || "",
                    specialization: currentResumeData.specialization || "",
                    experience: currentResumeData.experience || "",
                    projects: currentResumeData.projects || "",
                    content: ""
                  } as ResumeType : undefined}
                  onPreviewGenerated={handlePreviewGenerated}
                />
              )}
              
              {/* Step 2: Show preview with save/edit options */}
              {currentResumeContent && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-6">
                      <div className="mr-4 p-3 bg-purple-100 rounded-md">
                        <FileText className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium leading-6">Resume Preview</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Review your resume before saving it
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-md whitespace-pre-wrap font-mono text-sm max-h-80 overflow-y-auto">
                      {currentResumeContent}
                    </div>
                    
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Just clear the resume content but keep the form data
                          // This allows the form to re-render with the same values
                          setCurrentResumeContent(null);
                          // We keep currentResumeData intact for the form to use
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (currentResumeContent) {
                            navigator.clipboard.writeText(currentResumeContent);
                            toast({
                              title: "Copied to clipboard",
                              description: "Resume content has been copied to clipboard.",
                            });
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button 
                        variant="default"
                        onClick={handleSaveResume}
                        className="bg-accent hover:bg-accent/90"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Save to Collection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
          
          {documentType === "coverLetter" && (
            <CoverLetterGenerator />
          )}
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Documents</CardTitle>
              <CardDescription>
                View, download, or manage your previously generated documents.
              </CardDescription>
              
              <div className="mt-4">
                <Tabs value={documentType} onValueChange={(value) => setDocumentType(value as "resume" | "coverLetter")}>
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="resume">
                      Resumes
                      <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium">
                        {resumes.filter(doc => doc.specialization !== "Cover Letter").length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="coverLetter">
                      Cover Letters
                      <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium">
                        {resumes.filter(doc => doc.specialization === "Cover Letter").length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-gray-500">Loading documents...</p>
              ) : resumes.length === 0 || !resumes.some(resume => 
                  documentType === "resume" ? 
                    resume.specialization !== "Cover Letter" : 
                    resume.specialization === "Cover Letter"
                ) ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {resumes.length === 0 ? (
                    <>
                      <p className="text-lg font-medium">No documents yet</p>
                      <p className="mt-1">Create your first AI-powered document to get started.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No {documentType === "resume" ? "resumes" : "cover letters"} found</p>
                      <p className="mt-1">
                        {documentType === "resume" 
                          ? "Generate a resume to showcase your skills and experience." 
                          : "Create a cover letter to apply for a specific job or client."}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {resumes
                    .filter(resume => documentType === "resume" ? 
                      resume.specialization !== "Cover Letter" : 
                      resume.specialization === "Cover Letter")
                    .map((resume) => (
                      <div key={resume.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg">{resume.name}</h3>
                            <p className="text-sm text-gray-500">{resume.specialization}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Switch to create tab
                                console.log("Edit button clicked for resume:", resume.id);
                                setActiveTab("create");
                                
                                // Set editing mode
                                setIsEditing(true);
                                
                                // Start with the form instead of content
                                setCurrentResumeContent(null);
                                
                                const resumeData = {
                                  id: resume.id,
                                  name: resume.name,
                                  specialization: resume.specialization,
                                  experience: resume.experience,
                                  projects: resume.projects,
                                  targetProject: ""
                                };
                                
                                console.log("Setting currentResumeData for editing:", resumeData);
                                setCurrentResumeData(resumeData);
                              }}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCopyToClipboard(resume.content)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(resume)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setResumeToDelete(resume);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm max-h-48 overflow-y-auto">
                          {resume.content.length > 500 
                            ? `${resume.content.substring(0, 500)}...`
                            : resume.content}
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500">
                          <span className="font-medium">Experience:</span> {resume.experience.length > 100 
                            ? `${resume.experience.substring(0, 100)}...`
                            : resume.experience}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-center">Delete Resume</h2>
            <p className="text-center text-gray-500">
              Are you sure you want to delete this resume for {resumeToDelete?.name}? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end w-full space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setResumeToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteResume}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}