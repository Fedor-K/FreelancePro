import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TargetPositionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function TargetPositionForm({ formData, updateField }: TargetPositionFormProps) {
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementComplete, setEnhancementComplete] = useState(false);
  
  // Handle AI enhancement
  const enhanceResume = async () => {
    // Validate input
    if (!formData.jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a job description to enhance your resume",
        variant: "destructive"
      });
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      // Here we would normally make an API request to use OpenAI
      // For now, we'll simulate the process with a timeout
      setTimeout(() => {
        // Simulate enhanced data
        const enhancedSummary = "Experienced language professional with 5+ years specializing in technical translation and localization. Proven track record of delivering high-quality translations for technical documentation, software interfaces, and marketing materials. Skilled in CAT tools and terminology management with expertise in maintaining consistency across large projects.";
        
        updateField("summary", enhancedSummary);
        
        toast({
          title: "Resume enhanced!",
          description: "Your resume has been tailored to match the job description",
        });
        
        setEnhancementComplete(true);
        setIsEnhancing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your resume. Please try again.",
        variant: "destructive"
      });
      setIsEnhancing(false);
    }
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
            The job description helps our AI tailor your resume to highlight relevant skills and experience
          </p>
        </div>
      </div>
      
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            AI Resume Enhancement
          </CardTitle>
          <CardDescription>
            Let AI help you tailor your resume to match this position
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="optimize-keywords">Optimize Keywords</Label>
              <p className="text-xs text-muted-foreground">Identify and use industry-specific keywords</p>
            </div>
            <Switch id="optimize-keywords" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="highlight-experience">Highlight Relevant Experience</Label>
              <p className="text-xs text-muted-foreground">Emphasize experience that matches the job requirements</p>
            </div>
            <Switch id="highlight-experience" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="professional-tone">Professional Tone</Label>
              <p className="text-xs text-muted-foreground">Maintain a professional writing style</p>
            </div>
            <Switch id="professional-tone" defaultChecked />
          </div>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="tone-selection">Resume Tone</Label>
            <Select defaultValue="professional">
              <SelectTrigger id="tone-selection">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="confident">Confident</SelectItem>
                <SelectItem value="achievement">Achievement-focused</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full"
            onClick={enhanceResume}
            disabled={isEnhancing || !formData.jobDescription.trim()}
          >
            {isEnhancing ? (
              <div className="flex items-center">
                <span className="mr-2">Enhancing...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                {enhancementComplete ? "Enhance Again" : "Enhance My Resume"}
              </div>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {enhancementComplete && (
        <Alert className="bg-green-50 border-green-200">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Resume Enhanced!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your resume has been optimized for the target position. 
            Continue to preview and make any final adjustments.
          </AlertDescription>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-2 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
          >
            Continue to Preview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {!formData.jobDescription.trim() && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Job description needed</AlertTitle>
          <AlertDescription>
            For the best results, please enter a job description to help tailor your resume.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}