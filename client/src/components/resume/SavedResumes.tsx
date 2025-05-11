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
import { jsPDF } from "jspdf";

export default function SavedResumes() {
  const { toast } = useToast();
  const [previewResume, setPreviewResume] = useState<any>(null);
  
  // This would normally fetch saved resumes from the API
  const { data: resumes, isLoading } = useQuery({
    queryKey: ['/api/resumes'],
    enabled: false, // Disable until we have the API endpoint
  });
  
  // For demonstration, using mock data
  const mockResumes = [
    {
      id: 1,
      name: "Software Developer Resume",
      createdAt: "2023-05-10T14:30:00Z",
      lastUpdated: "2023-05-11T09:15:00Z",
      targetPosition: "Senior Software Developer",
      template: "professional",
    },
    {
      id: 2,
      name: "Technical Writer Position",
      createdAt: "2023-04-22T11:20:00Z",
      lastUpdated: "2023-04-22T11:20:00Z",
      targetPosition: "Technical Writer",
      template: "minimal",
    }
  ];
  
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
  const handleDownload = (resumeId: number) => {
    toast({
      title: "Download Started",
      description: "Your resume is being prepared for download.",
    });
    
    try {
      // Find the resume data
      const resume = mockResumes.find(r => r.id === resumeId);
      if (!resume) {
        toast({
          title: "Error",
          description: "Resume not found.",
          variant: "destructive"
        });
        return;
      }
      
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Sample Resume", pageWidth/2, 20, { align: "center" });
      
      // Add title
      doc.setFontSize(16);
      doc.text(resume.name, pageWidth/2, 30, { align: "center" });
      
      // Add target position
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Target Position: ${resume.targetPosition}`, pageWidth/2, 40, { align: "center" });
      
      // Add date and template
      doc.setFontSize(10);
      doc.text(`Created: ${new Date(resume.createdAt).toLocaleDateString()}`, pageWidth/2, 50, { align: "center" });
      doc.text(`Template: ${resume.template}`, pageWidth/2, 55, { align: "center" });
      
      // Add sample content
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Professional Summary", 20, 70);
      
      doc.setFont("helvetica", "normal");
      const summary = "Experienced translator with 5+ years specializing in technical translation and localization. Proven track record of delivering high-quality translations for technical documentation, software interfaces, and marketing materials. Skilled in CAT tools and terminology management.";
      
      // Wrap text
      const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
      doc.text(splitSummary, 20, 80);
      
      // Add some more sample sections
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Skills", 20, 105);
      
      doc.setFont("helvetica", "normal");
      doc.text("• Translation and Localization", 25, 115);
      doc.text("• CAT Tools (SDL Trados, MemoQ)", 25, 122);
      doc.text("• Terminology Management", 25, 129);
      doc.text("• Quality Assurance", 25, 136);
      
      // Save the PDF
      doc.save(`${resume.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      
      toast({
        title: "Downloaded Successfully",
        description: "Your resume has been downloaded.",
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
  
  // Handle resume delete
  const handleDelete = (resumeId: number) => {
    toast({
      title: "Resume Deleted",
      description: "The resume has been deleted successfully.",
    });
  };
  
  // Handle resume copy
  const handleCopy = (resumeId: number) => {
    toast({
      title: "Resume Duplicated",
      description: "A copy of the resume has been created.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
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
          {mockResumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockResumes.map((resume) => (
                <Card key={resume.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{resume.name}</CardTitle>
                        <CardDescription>
                          {new Date(resume.lastUpdated).toLocaleDateString()} • {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)} Template
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{resume.targetPosition}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground">
                      <span>Created: {new Date(resume.createdAt).toLocaleDateString()}</span>
                      {resume.createdAt !== resume.lastUpdated && (
                        <span> • Last updated: {new Date(resume.lastUpdated).toLocaleDateString()}</span>
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
          <Alert>
            <AlertTitle>No saved cover letters</AlertTitle>
            <AlertDescription>
              You haven't created any standalone cover letters yet. You can create cover letters along with your resumes.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
      
      {/* Resume Preview Dialog */}
      <Dialog open={!!previewResume} onOpenChange={(open) => !open && setPreviewResume(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewResume?.name}</DialogTitle>
            <DialogDescription>
              Preview of your resume for {previewResume?.targetPosition}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] border rounded-md">
            <div className="p-6">
              {/* This would be replaced with an actual resume preview */}
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">John Smith</h1>
                  <p className="text-muted-foreground">Senior Translation Specialist</p>
                  <div className="flex justify-center gap-2 text-sm mt-1">
                    <span>john@example.com</span>
                    <span>•</span>
                    <span>+1 (555) 123-4567</span>
                    <span>•</span>
                    <span>New York, NY</span>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">Summary</h2>
                  <p className="text-sm">
                    Experienced translator with over 8 years of expertise in technical and business translation. Specialized in English to Spanish and English to French translations for software, legal, and marketing materials.
                  </p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">Professional Experience</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Senior Translator</h3>
                      <p className="text-sm text-muted-foreground">GlobalTech Translations • 2018-Present</p>
                      <p className="text-sm mt-1">
                        Led translation projects for major tech clients, managing terminology databases and ensuring consistency across all materials.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Freelance Translator</h3>
                      <p className="text-sm text-muted-foreground">Self-employed • 2015-2018</p>
                      <p className="text-sm mt-1">
                        Provided translation services for various clients in technical, legal, and marketing fields.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Translation</Badge>
                    <Badge variant="outline">Localization</Badge>
                    <Badge variant="outline">Proofreading</Badge>
                    <Badge variant="outline">CAT Tools</Badge>
                    <Badge variant="outline">SDL Trados</Badge>
                    <Badge variant="outline">MemoQ</Badge>
                    <Badge variant="outline">Terminology Management</Badge>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">Languages</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">English:</span> Native
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Spanish:</span> Fluent (C2)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">French:</span> Fluent (C1)
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">German:</span> Intermediate (B1)
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold border-b pb-1 mb-2">Education</h2>
                  <div>
                    <h3 className="font-medium">Master's in Translation Studies</h3>
                    <p className="text-sm text-muted-foreground">University of Translation • 2015</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewResume(null)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setPreviewResume(null);
                handleDownload(previewResume?.id);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}