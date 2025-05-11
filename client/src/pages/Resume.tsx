import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileEdit, PlusCircle, Download, FilePlus, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ResumeBuilder from "@/components/resume/ResumeBuilder";
import SavedResumes from "@/components/resume/SavedResumes";

export default function Resume() {
  const [activeTab, setActiveTab] = useState("saved");
  const [showBuilder, setShowBuilder] = useState(false);
  
  const handleCreateResume = () => {
    setShowBuilder(true);
    setActiveTab("create");
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create, manage, and optimize your professional resumes
          </p>
        </div>
        
        {!showBuilder && (
          <Button onClick={handleCreateResume}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Resume
          </Button>
        )}
      </div>
      
      {showBuilder ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">New Resume</h2>
            <Button variant="outline" onClick={() => setShowBuilder(false)}>
              Back to Saved Resumes
            </Button>
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Resume Creation Tips</CardTitle>
              <CardDescription>
                Follow these guidelines to create an effective resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <span className="font-medium">Tailor to the job</span>
                  <p className="text-sm text-muted-foreground">
                    Customize your resume for each position by highlighting relevant skills and experience
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <span className="font-medium">Be concise</span>
                  <p className="text-sm text-muted-foreground">
                    Keep your resume to 1-2 pages and use bullet points for easy scanning
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <span className="font-medium">Highlight achievements</span>
                  <p className="text-sm text-muted-foreground">
                    Focus on quantifiable results rather than just listing job duties
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <span className="font-medium">Include relevant skills</span>
                  <p className="text-sm text-muted-foreground">
                    List technical skills, software proficiency, and language capabilities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ResumeBuilder />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Saved Resumes</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="space-y-6">
            <SavedResumes />
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Resume Templates</h2>
              <p className="text-muted-foreground">
                Start with a professionally designed template
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Professional Template */}
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                  {/* This would be an image of the template */}
                  <div className="absolute inset-0 p-6 flex flex-col">
                    <div className="text-center mb-4">
                      <div className="h-5 w-40 bg-gray-300 mx-auto rounded"></div>
                      <div className="h-3 w-32 bg-gray-200 mx-auto mt-2 rounded"></div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div>
                      <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Professional</CardTitle>
                      <CardDescription>
                        Classic design for most industries
                      </CardDescription>
                    </div>
                    <Badge>Popular</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCreateResume}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Modern Template */}
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                  {/* This would be an image of the template */}
                  <div className="absolute inset-0 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="h-5 w-32 bg-gray-300 rounded"></div>
                        <div className="h-3 w-24 bg-gray-200 mt-1 rounded"></div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-gray-300"></div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      </div>
                      <div>
                        <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                        <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="h-3 w-20 bg-gray-300 mb-2 rounded"></div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                        <div className="h-8 w-full bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>Modern</CardTitle>
                  <CardDescription>
                    Contemporary design with clean layout
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCreateResume}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Minimal Template */}
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative bg-gray-100 overflow-hidden">
                  {/* This would be an image of the template */}
                  <div className="absolute inset-0 p-6 flex flex-col">
                    <div className="text-left mb-6">
                      <div className="h-6 w-48 bg-gray-300 rounded"></div>
                      <div className="h-3 w-32 bg-gray-200 mt-2 rounded"></div>
                      <div className="flex gap-2 mt-2">
                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-3 w-20 bg-gray-300 mb-3 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-2 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-2 rounded"></div>
                      <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="h-3 w-20 bg-gray-300 mb-3 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 mb-1 rounded"></div>
                      <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                    
                    <div>
                      <div className="h-3 w-20 bg-gray-300 mb-3 rounded"></div>
                      <div className="flex flex-wrap gap-1">
                        <div className="h-2 w-12 bg-gray-200 rounded"></div>
                        <div className="h-2 w-12 bg-gray-200 rounded"></div>
                        <div className="h-2 w-12 bg-gray-200 rounded"></div>
                        <div className="h-2 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>Minimal</CardTitle>
                  <CardDescription>
                    Simple and elegant for a clean look
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCreateResume}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => window.open('#', '_blank')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Create Custom Template */}
              <Card className="overflow-hidden border-dashed border-2 bg-muted/20">
                <div className="aspect-[3/4] flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <FilePlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Create Custom Template</h3>
                      <p className="text-sm text-muted-foreground">
                        Start from scratch with your own design
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="py-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCreateResume}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start Blank Resume
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}