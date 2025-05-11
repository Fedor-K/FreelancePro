import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createResumePreviewHTML } from "@/lib/resumeTemplate";

interface TargetPositionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  nextStep?: () => void;
}

export default function TargetPositionForm({ formData, updateField, nextStep }: TargetPositionFormProps) {
  const { toast } = useToast(); 
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeGenerated, setResumeGenerated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  
  const generateCV = () => {
    if (!formData.targetPosition.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a target position to generate your CV",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    // Generate resume preview HTML
    setTimeout(() => {
      const html = createResumePreviewHTML(formData);
      setPreviewHtml(html);
      setResumeGenerated(true);
      setIsGenerating(false);
      setIsEditing(false);
      
      toast({
        title: "CV generated!",
        description: "Your CV has been generated successfully",
      });
    }, 800); // Short delay to show loading state
  };
  
  const handleEditCV = () => {
    setIsEditing(true);
    // Keep the resume generated state true so the preview remains visible
    
    toast({
      title: "Editing CV",
      description: "You can now edit the CV details and regenerate when ready",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetCompany">Target Company (Optional)</Label>
            <Input
              id="targetCompany"
              value={formData.targetCompany}
              onChange={(e) => updateField("targetCompany", e.target.value)}
              placeholder="Company you're applying to"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetPosition">Target Position</Label>
            <Input
              id="targetPosition"
              value={formData.targetPosition}
              onChange={(e) => updateField("targetPosition", e.target.value)}
              placeholder="Position you're applying for"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            value={formData.jobDescription}
            onChange={(e) => updateField("jobDescription", e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            The job description helps tailor your resume to highlight relevant skills and experience
          </p>
        </div>
        
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={generateCV}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <div className="flex items-center">
                <span className="mr-2">Generating...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {isEditing ? "Update Preview" : "Generate CV"}
              </div>
            )}
          </Button>
        </div>
      </div>
      
      {resumeGenerated && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">CV Preview</h3>
            {isEditing && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">
                Editing
              </span>
            )}
          </div>
          <Card className="border-green-200 overflow-hidden">
            <CardContent className="p-0 h-[300px] overflow-auto">
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              className="text-blue-600 mr-2"
              onClick={handleEditCV}
            >
              Edit CV
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={nextStep}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {!formData.targetPosition.trim() && !resumeGenerated && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Target position needed</AlertTitle>
          <AlertDescription>
            Please enter a target position to generate your CV.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}