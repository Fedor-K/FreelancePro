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
      
      // Create PDF document that matches the preview
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add header with name and title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("John Smith", pageWidth/2, 20, { align: "center" });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Senior Translation Specialist", pageWidth/2, 30, { align: "center" });
      
      // Add contact info
      doc.setFontSize(10);
      const contactInfo = ["john@example.com", "+1 (555) 123-4567", "New York, NY"];
      doc.text(contactInfo.join(" • "), pageWidth/2, 40, { align: "center" });
      
      // Summary
      let yPosition = 50;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 20, yPosition);
      doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summary = "Experienced translator with over 8 years of expertise in technical and business translation. Specialized in English to Spanish and English to French translations for software, legal, and marketing materials.";
      const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
      doc.text(splitSummary, 20, yPosition + 10);
      
      yPosition += 10 + (splitSummary.length * 5) + 10;
      
      // Professional Experience
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Professional Experience", 20, yPosition);
      doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
      
      yPosition += 10;
      
      // First job
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Senior Translator", 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("GlobalTech Translations", 20, yPosition);
      yPosition += 5;
      doc.text("2018-Present", 20, yPosition);
      yPosition += 5;
      
      const jobDesc = "Led translation projects for major tech clients, managing terminology databases and ensuring consistency across all materials.";
      const splitJobDesc = doc.splitTextToSize(jobDesc, pageWidth - 40);
      doc.text(splitJobDesc, 20, yPosition);
      
      yPosition += (splitJobDesc.length * 5) + 10;
      
      // Second job
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Freelance Translator", 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Self-employed", 20, yPosition);
      yPosition += 5;
      doc.text("2015-2018", 20, yPosition);
      yPosition += 5;
      
      const job2Desc = "Provided translation services for various clients in technical, legal, and marketing fields.";
      const splitJob2Desc = doc.splitTextToSize(job2Desc, pageWidth - 40);
      doc.text(splitJob2Desc, 20, yPosition);
      
      yPosition += (splitJob2Desc.length * 5) + 15;
      
      // Skills
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Skills", 20, yPosition);
      doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const skills = ["Translation", "Localization", "Proofreading", "CAT Tools", "SDL Trados", "MemoQ", "Terminology Management"];
      let skillsText = skills.join(", ");
      
      const splitSkills = doc.splitTextToSize(skillsText, pageWidth - 40);
      doc.text(splitSkills, 20, yPosition);
      
      yPosition += (splitSkills.length * 5) + 15;
      
      // Languages
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Languages", 20, yPosition);
      doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
      
      yPosition += 10;
      doc.setFontSize(10);
      
      // Format languages in a grid
      const languages = [
        { language: "English", level: "Native" },
        { language: "Spanish", level: "Fluent (C2)" },
        { language: "French", level: "Fluent (C1)" },
        { language: "German", level: "Intermediate (B1)" }
      ];
      
      const languageRows = Math.ceil(languages.length / 2);
      
      for (let i = 0; i < languageRows; i++) {
        // First column
        if (i < languages.length) {
          const lang = languages[i];
          doc.setFont("helvetica", "bold");
          doc.text(`${lang.language}:`, 20, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(lang.level, 60, yPosition);
        }
        
        // Second column (if there's an item)
        if (i + languageRows < languages.length) {
          const lang = languages[i + languageRows];
          doc.setFont("helvetica", "bold");
          doc.text(`${lang.language}:`, pageWidth/2, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(lang.level, pageWidth/2 + 40, yPosition);
        }
        
        yPosition += 7;
      }
      
      yPosition += 15;
      
      // Education
      if (yPosition > 220) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Education", 20, yPosition);
      doc.line(20, yPosition + 1, pageWidth - 20, yPosition + 1);
      
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Master's in Translation Studies", 20, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("University of Translation", 20, yPosition);
      yPosition += 5;
      doc.text("2015", 20, yPosition);
      
      // Save the PDF with the appropriate name
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