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
import { createResumePreviewHTML, downloadResume } from "@/lib/resumeTemplate";

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
      
      // Sample resume data that matches the preview
      const resumeData = {
        name: "John Smith",
        professionalTitle: "Senior Translation Specialist",
        email: "john@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        website: "johnsmith.portfolio.com",
        summary: "Experienced translator with over 8 years of expertise in technical and business translation. Specialized in English to Spanish and English to French translations for software, legal, and marketing materials.",
        skills: ["Translation", "Localization", "Proofreading", "CAT Tools", "SDL Trados", "MemoQ", "Terminology Management"],
        languages: [
          { language: "English", level: "Native" },
          { language: "Spanish", level: "Fluent (C2)" },
          { language: "French", level: "Fluent (C1)" },
          { language: "German", level: "Intermediate (B1)" }
        ],
        experience: [
          {
            role: "Senior Translator",
            company: "GlobalTech Translations",
            startDate: "2018",
            endDate: "Present",
            description: "Led translation projects for major tech clients, managing terminology databases and ensuring consistency across all materials."
          },
          {
            role: "Freelance Translator",
            company: "Self-employed",
            startDate: "2015",
            endDate: "2018",
            description: "Provided translation services for various clients in technical, legal, and marketing fields."
          }
        ],
        education: [
          {
            degree: "Master's in Translation Studies",
            institution: "University of Translation",
            year: "2015",
            description: ""
          }
        ]
      };
      
      // Use our shared template function for downloading
      downloadResume(resumeData, resume.name);
      
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
                    ${createResumePreviewHTML({
                      name: "John Smith",
                      professionalTitle: "Senior Translation Specialist",
                      email: "john@example.com",
                      phone: "+1 (555) 123-4567",
                      location: "New York, NY",
                      website: "johnsmith.portfolio.com",
                      summary: "Experienced translator with over 8 years of expertise in technical and business translation. Specialized in English to Spanish and English to French translations for software, legal, and marketing materials.",
                      skills: ["Translation", "Localization", "Proofreading", "CAT Tools", "SDL Trados", "MemoQ", "Terminology Management"],
                      languages: [
                        { language: "English", level: "Native" },
                        { language: "Spanish", level: "Fluent (C2)" },
                        { language: "French", level: "Fluent (C1)" },
                        { language: "German", level: "Intermediate (B1)" }
                      ],
                      experience: [
                        {
                          role: "Senior Translator",
                          company: "GlobalTech Translations",
                          startDate: "2018",
                          endDate: "Present",
                          description: "Led translation projects for major tech clients, managing terminology databases and ensuring consistency across all materials."
                        },
                        {
                          role: "Freelance Translator",
                          company: "Self-employed",
                          startDate: "2015",
                          endDate: "2018",
                          description: "Provided translation services for various clients in technical, legal, and marketing fields."
                        }
                      ],
                      education: [
                        {
                          degree: "Master's in Translation Studies",
                          institution: "University of Translation",
                          year: "2015",
                          description: ""
                        }
                      ]
                    })}
                  </body>
                </html>
              `}
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '500px' }}
              title="Resume Preview"
            />
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