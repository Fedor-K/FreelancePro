import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { FileText, Download, Copy, Trash2, Edit, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function Resume() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeType | null>(null);
  const [resumeToEdit, setResumeToEdit] = useState<ResumeType | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [documentType, setDocumentType] = useState<"resume" | "coverLetter">("resume");
  
  // Add logging for state changes
  useEffect(() => {
    console.log("[Resume] resumeToEdit changed:", resumeToEdit);
  }, [resumeToEdit]);
  
  useEffect(() => {
    console.log("[Resume] activeTab changed:", activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    console.log("[Resume] documentType changed:", documentType);
  }, [documentType]);
  
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

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center mb-6">
            <div className="mr-4 p-3 bg-purple-100 rounded-md">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Document Generator</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create professional resumes and cover letters powered by AI to help you land your next freelance client.
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="create">Create Document</TabsTrigger>
              <TabsTrigger value="saved">Saved Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <div className="mb-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Document Type</label>
                  <Select value={documentType} onValueChange={(value) => setDocumentType(value as "resume" | "coverLetter")}>
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
              
              {documentType === "resume" ? 
                <ResumeGenerator 
                  key={resumeToEdit ? `edit-resume-${resumeToEdit.id}` : 'new-resume'}
                  resumeToEdit={resumeToEdit} 
                  onEditComplete={() => {
                    console.log("[Resume] Edit complete, clearing resumeToEdit state");
                    setResumeToEdit(null);
                    refetch();
                    // Force a delay before showing the saved tab to allow for the refetch to complete
                    setTimeout(() => setActiveTab("saved"), 500);
                  }}
                /> : 
                <CoverLetterGenerator />
              }
            </TabsContent>
            
            <TabsContent value="saved">
              <div className="mb-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Document Type</label>
                  <Select value={documentType} onValueChange={(value) => setDocumentType(value as "resume" | "coverLetter")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resume">
                        Resumes ({resumes.filter(doc => doc.specialization !== "Cover Letter").length})
                      </SelectItem>
                      <SelectItem value="coverLetter">
                        Cover Letters ({resumes.filter(doc => doc.specialization === "Cover Letter").length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
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
                              className="bg-gray-50 text-gray-700"
                              onClick={() => {
                                console.log("[Resume] Edit button clicked for resume:", resume);
                                setResumeToEdit({...resume});
                                setDocumentType("resume"); // Ensure document type is set to resume
                                setActiveTab("create");
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Document
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
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