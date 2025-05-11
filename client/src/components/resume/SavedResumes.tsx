import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileEdit, Trash2, Eye, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { createResumePreviewHTML, downloadResume, createCoverLetterPreviewHTML, downloadCoverLetter } from "@/lib/resumeTemplate";
import jsPDF from "jspdf";

export default function SavedResumes() {
  const { toast } = useToast();
  const [previewResume, setPreviewResume] = useState<any>(null);
  
  // Fetch resumes from the API
  const { data: resumes, isLoading, refetch } = useQuery({
    queryKey: ['/api/resumes'],
    enabled: true,
  });
  
  // Handle resume preview
  const handlePreview = (resume: any) => {
    setPreviewResume(resume);
  };
  
  // Handle resume edit
  const handleEdit = (resumeId: number) => {
    // Implementation would load this resume into the builder
    toast({
      title: "Edit Resume",
      description: "This would load the resume into the builder for editing.",
    });
  };
  
  // Handle resume download
  const handleDownload = async (resumeId: number) => {
    toast({
      title: "Download Started",
      description: "Your document is being prepared for download.",
    });
    
    try {
      // Fetch the resume data
      const response = await fetch(`/api/resumes/${resumeId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
      }
      
      const resume = await response.json();
      
      if (resume.type === 'resume') {
        // For resume, parse the content which contains the form data
        try {
          const resumeData = JSON.parse(resume.content);
          downloadResume(resumeData, resume.name);
        } catch (parseError) {
          console.error("Error parsing resume content:", parseError);
          toast({
            title: "Error",
            description: "Could not parse resume content.",
            variant: "destructive"
          });
          return;
        }
      } else if (resume.type === 'cover_letter') {
        // For cover letter, we'll use downloadCoverLetter if the form data is available
        try {
          const formData = JSON.parse(resume.content);
          downloadCoverLetter(formData);
        } catch (parseError) {
          // If can't parse as JSON, it's probably plain text
          const doc = new jsPDF();
          const fontSize = 11;
          const margin = 15;
          
          // Set font
          doc.setFont("Helvetica");
          doc.setFontSize(fontSize);
          
          // Add text with proper line breaks
          const textLines = doc.splitTextToSize(resume.content, doc.internal.pageSize.width - 2 * margin);
          doc.text(textLines, margin, margin);
          
          // Save the PDF
          doc.save(`${resume.name}.pdf`);
        }
      }
      
      toast({
        title: "Downloaded Successfully",
        description: "Your document has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your document. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle resume delete
  const handleDelete = async (resumeId: number) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete resume: ${response.statusText}`);
      }
      
      // Refetch the data to update the UI
      refetch();
      
      toast({
        title: "Resume Deleted",
        description: "The resume has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Error",
        description: "Failed to delete the resume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Handle resume copy
  const handleCopy = async (resumeId: number) => {
    try {
      // First get the resume to copy
      const getResponse = await fetch(`/api/resumes/${resumeId}`);
      
      if (!getResponse.ok) {
        throw new Error(`Failed to get resume: ${getResponse.statusText}`);
      }
      
      const resumeToCopy = await getResponse.json();
      
      // Create a new resume with the same data but a different name
      const newResume = {
        ...resumeToCopy,
        name: `${resumeToCopy.name} (Copy)`,
      };
      
      // Remove id and createdAt as they'll be set by the server
      delete newResume.id;
      delete newResume.createdAt;
      
      const createResponse = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResume),
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create resume copy: ${createResponse.statusText}`);
      }
      
      // Refetch the data to update the UI
      refetch();
      
      toast({
        title: "Resume Duplicated",
        description: "A copy of the resume has been created.",
      });
    } catch (error) {
      console.error("Error copying resume:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate the resume. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Saved Resumes</h2>
        <p className="text-muted-foreground">
          Your previously created resumes and cover letters
        </p>
      </div>
      
      <Tabs defaultValue="resumes">
        <TabsList>
          <TabsTrigger value="resumes">Resumes</TabsTrigger>
          <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resumes" className="space-y-4">
          {resumes && resumes.filter((r: any) => r.type === 'resume').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.filter((resume: any) => resume.type === 'resume').map((resume: any) => (
                <Card key={resume.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resume.name}</CardTitle>
                        <CardDescription>
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {resume.targetPosition && (
                        <Badge variant="outline">{resume.targetPosition}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <span>Created: {new Date(resume.createdAt).toLocaleDateString()}</span>
                      {resume.targetCompany && (
                        <div className="mt-1">Company: {resume.targetCompany}</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(resume.id)}
                    >
                      <FileEdit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(resume.id)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(resume.id)}
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Duplicate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(resume.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>No saved resumes</AlertTitle>
              <AlertDescription>
                You haven't created any resumes yet. Create a new resume to get started.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="cover-letters" className="space-y-4">
          {resumes && resumes.filter((r: any) => r.type === 'cover_letter').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumes.filter((resume: any) => resume.type === 'cover_letter').map((resume: any) => (
                <Card key={resume.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resume.name}</CardTitle>
                        <CardDescription>
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {resume.targetPosition && (
                        <Badge variant="outline">{resume.targetPosition}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <span>Created: {new Date(resume.createdAt).toLocaleDateString()}</span>
                      {resume.targetCompany && (
                        <div className="mt-1">Company: {resume.targetCompany}</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(resume.id)}
                    >
                      <FileEdit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(resume.id)}
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopy(resume.id)}
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Duplicate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(resume.id)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTitle>No saved cover letters</AlertTitle>
              <AlertDescription>
                You haven't created any standalone cover letters yet. You can create cover letters along with your resumes.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Resume Preview Dialog */}
      <Dialog open={!!previewResume} onOpenChange={(open) => !open && setPreviewResume(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewResume?.name}</DialogTitle>
            <DialogDescription>
              Preview of your {previewResume?.type === 'resume' ? 'resume' : 'cover letter'} 
              {previewResume?.targetPosition ? ` for ${previewResume.targetPosition}` : ''}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] border rounded-md">
            <iframe
              srcDoc={previewResume?.htmlContent || `
                <html>
                  <head>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        text-align: center;
                      }
                    </style>
                  </head>
                  <body>
                    <div>
                      <h3 style="color: #666;">Preview not available</h3>
                      <p>The content for this document could not be displayed.</p>
                    </div>
                  </body>
                </html>
              `}
              className="w-full h-full border-none"
              title="Resume Preview"
            />
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPreviewResume(null)}
            >
              Close
            </Button>
            {previewResume && (
              <Button 
                onClick={() => handleDownload(previewResume.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}