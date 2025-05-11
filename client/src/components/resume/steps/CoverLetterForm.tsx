import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCoverLetterPreviewHTML } from "@/lib/resumeTemplate";

interface CoverLetterFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function CoverLetterForm({ formData, updateField }: CoverLetterFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  
  // Generate cover letter with AI using OpenAI API
  const generateCoverLetter = async () => {
    if (!formData.targetPosition) {
      toast({
        title: "Missing information",
        description: "Please specify the target position to generate a cover letter",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get sanitized data to send to the API
      const sanitizedData = {
        name: formData.name ? formData.name.replace(/<[^>]*>/g, '') : "",
        jobTitle: formData.jobTitle ? formData.jobTitle.replace(/<[^>]*>/g, '') : "",
        targetPosition: formData.targetPosition ? formData.targetPosition.replace(/<[^>]*>/g, '') : "",
        targetCompany: formData.targetCompany ? formData.targetCompany.replace(/<[^>]*>/g, '') : "",
        selectedProjects: formData.selectedProjects || [],
        jobDescription: formData.jobDescription ? formData.jobDescription.replace(/<[^>]*>/g, '') : "",
        skills: formData.skills || []
      };
      
      // Call the API to generate the cover letter
      const response = await fetch('/api/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.coverLetter) {
        // Update the form with the generated cover letter
        updateField("coverLetter", result.coverLetter);
        
        toast({
          title: "Cover letter generated!",
          description: "Your professional cover letter has been created using AI",
        });
        
        setActiveTab("preview");
      } else {
        throw new Error("No cover letter content returned");
      }
    } catch (error) {
      console.error("Cover letter generation error:", error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your cover letter. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Cover Letter</h2>
        <p className="text-sm text-muted-foreground">
          Create a personalized cover letter to accompany your resume
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6 pt-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Professional Cover Letter Generator
              </CardTitle>
              <CardDescription>
                Creates a concise, straightforward cover letter focused on your skills and experience
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="pt-0">
              <Button 
                className="w-full"
                variant="accent"
                onClick={generateCoverLetter}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <span className="mr-2">Creating Letter...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Concise Professional Cover Letter
                  </div>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter Content</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter || ""}
              onChange={(e) => updateField("coverLetter", e.target.value)}
              placeholder="Type or paste your cover letter here, or use the AI generator..."
              rows={14}
              className="font-mono text-sm"
            />
          </div>
          
          {!formData.targetPosition && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Missing information</AlertTitle>
              <AlertDescription>
                Please complete the target position in the previous step for a better cover letter.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cover Letter Preview</CardTitle>
              <CardDescription>
                Preview how your cover letter will look when exported
              </CardDescription>
            </CardHeader>
            
            <CardContent className="border-t pt-4">
              {formData.coverLetter ? (
                <div className="relative">
                  <iframe
                    title="Cover Letter Preview"
                    srcDoc={createCoverLetterPreviewHTML(formData)}
                    className="w-full h-[40rem] border rounded"
                    style={{ backgroundColor: "white" }}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                  <h3 className="text-lg font-medium mb-1">No cover letter content yet</h3>
                  <p className="max-w-md mx-auto">
                    Generate or write a cover letter in the Edit tab to see a preview here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}