import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, CheckCircle2 } from "lucide-react";
import ResumeBuilder from "@/components/resume/ResumeBuilder";
import SavedResumes from "@/components/resume/SavedResumes";

export default function Resume() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [resumeToEdit, setResumeToEdit] = useState<number | null>(null);
  
  const handleCreateResume = () => {
    setResumeToEdit(null);
    setShowBuilder(true);
  };
  
  const handleEditResume = (resumeId: number) => {
    setResumeToEdit(resumeId);
    setShowBuilder(true);
  };
  
  const handleBackToResumes = () => {
    setShowBuilder(false);
    setResumeToEdit(null);
    // Increment the refresh key to trigger a reload of the saved resumes
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Builder</h1>
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
            <h2 className="text-2xl font-bold">{resumeToEdit ? 'Edit Resume' : 'New Resume'}</h2>
            <Button variant="outline" onClick={handleBackToResumes}>
              Back to Saved Resumes
            </Button>
          </div>
          
          {!resumeToEdit && (
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
          )}
          
          <ResumeBuilder resumeId={resumeToEdit} />
        </div>
      ) : (
        <div className="space-y-6">
          <SavedResumes key={refreshKey} onEditResume={handleEditResume} />
        </div>
      )}
    </div>
  );
}