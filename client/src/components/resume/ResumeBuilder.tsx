import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

// Define types for resume data
interface ResumeData {
  id: number;
  name: string;
  content: string;
  type: string;
  targetPosition?: string;
  targetCompany?: string;
  createdAt: string;
  userId: number;
}

import ProjectSelectionForm from "./steps/ProjectSelectionForm";
import TargetPositionForm from "./steps/TargetPositionForm";
import PreviewExportForm from "./steps/PreviewExportForm";
import CoverLetterForm from "./steps/CoverLetterForm";

import { ChevronLeft, ChevronRight, Save, PlayCircle, Loader2 } from "lucide-react";

const STEPS = [
  { id: 'resume-building', title: 'Resume Building' },
  { id: 'cover-letter', title: 'Cover Letter' },
  { id: 'preview-export', title: 'Preview & Export' },
];

interface ResumeBuilderProps {
  resumeId: number | null;
}

export default function ResumeBuilder({ resumeId }: ResumeBuilderProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(!!resumeId);
  
  // Fetch resume data if in edit mode
  const { data: resumeData, isLoading: isLoadingResume } = useQuery<ResumeData>({
    queryKey: [`/api/resumes/${resumeId}`],
    enabled: !!resumeId, // Only run if resumeId is provided
    staleTime: Infinity, // Don't refetch automatically
  });
  
  // Update form data when resume data is loaded
  useEffect(() => {
    if (resumeData && isEditMode) {
      try {
        // If the resume has content, parse it as JSON
        if (resumeData && typeof resumeData === 'object' && 'content' in resumeData) {
          const parsedContent = JSON.parse(resumeData.content as string);
          
          // Update form data with the parsed content
          setFormData(prev => ({
            ...prev,
            ...parsedContent,
            // Additional fields that might be in the top level of resumeData
            targetPosition: ('targetPosition' in resumeData) ? resumeData.targetPosition : prev.targetPosition,
            targetCompany: ('targetCompany' in resumeData) ? resumeData.targetCompany : prev.targetCompany,
          }));
          
          // Display success message
          toast({
            title: "Resume loaded",
            description: "Resume data has been loaded for editing.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error parsing resume content:", error);
        toast({
          title: "Error",
          description: "Failed to load resume data. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [resumeData, isEditMode, toast]);
  const [formData, setFormData] = useState({
    // Basic information (auto-populated from settings)
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    website: "https://johndoe.com",
    professionalTitle: "Professional Translator",
    summary: "Freelance translator and editor with 5+ years of experience in technical and business translation. Specialized in English to French and English to Spanish translations for software, legal, and marketing materials.",
    
    // Projects
    selectedProjects: [],
    
    // Skills & Experience (auto-populated from settings)
    skills: ["Translation", "Localization", "Proofreading", "CAT Tools", "SDL Trados", "MemoQ", "Terminology Management"],
    languages: [
      { language: "English", level: "Native" },
      { language: "Spanish", level: "Fluent (C2)" },
      { language: "French", level: "Fluent (C1)" },
      { language: "German", level: "Intermediate (B1)" }
    ],
    education: [
      {
        degree: "Master's in Translation Studies",
        institution: "University of Translation",
        year: "2015",
        description: "Specialized in technical and scientific translation"
      }
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
    
    // Target position
    targetCompany: "",
    targetPosition: "",
    jobDescription: "",
    
    // Cover letter
    coverLetter: "",
    
    // Preview & Export
    template: "professional",
  });
  
  // Calculate progress percentage
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  
  // Update a single field
  const updateField = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  
  // Update multiple fields at once
  const updateFields = (fields: Record<string, any>) => {
    setFormData({
      ...formData,
      ...fields,
    });
  };
  
  // Handle next step
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Jump to specific step
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setCurrentStep(stepIndex);
      window.scrollTo(0, 0);
    }
  };
  
  // Create resume mutation
  const createResumeMutation = useMutation({
    mutationFn: async (resumeData: any) => {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create resume');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the resumes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      
      toast({
        title: "Resume saved",
        description: "Your resume has been saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update resume mutation
  const updateResumeMutation = useMutation({
    mutationFn: async ({ id, resumeData }: { id: number, resumeData: any }) => {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update resume');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the resumes query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      
      toast({
        title: "Resume updated",
        description: "Your resume has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating resume",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Save or update resume
  const saveResumeDraft = async () => {
    // Create a name for the resume based on the target position and company
    const resumeName = formData.targetPosition 
      ? `Resume for ${formData.targetPosition}${formData.targetCompany ? ` at ${formData.targetCompany}` : ''}`
      : `Resume ${new Date().toLocaleDateString()}`;
    
    const resumeData = {
      name: resumeName,
      type: 'resume',
      content: JSON.stringify(formData),
      targetPosition: formData.targetPosition,
      targetCompany: formData.targetCompany,
    };
    
    if (isEditMode && resumeId) {
      // Update existing resume
      updateResumeMutation.mutate({ id: resumeId, resumeData });
    } else {
      // Create new resume
      createResumeMutation.mutate(resumeData);
    }
  };
  
  // Render current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 0: // Resume Building (combines Project Selection and Target Position steps)
        return (
          <div className="space-y-8">
            {/* Project Selection part */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Resume Building</h2>
                <p className="text-sm text-muted-foreground">
                  Select projects to include in your resume and specify the position you're applying for
                </p>
              </div>
              
              <ProjectSelectionForm 
                formData={formData} 
                updateField={updateField} 
              />
              
              {/* Target Position entry */}
              <div className="space-y-4 pt-6 border-t">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Target Position</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter details about the position you're applying for
                  </p>
                </div>
                
                <TargetPositionForm 
                  formData={formData} 
                  updateField={updateField}
                  nextStep={nextStep}
                />
              </div>
            </div>
          </div>
        );
      case 1: // Cover Letter
        return (
          <CoverLetterForm 
            formData={formData} 
            updateField={updateField} 
          />
        );
      case 2: // Preview & Export
        return (
          <PreviewExportForm 
            formData={formData} 
            updateField={updateField} 
          />
        );
      default:
        return null;
    }
  };
  
  // Show loading indicator when fetching resume data
  if (isLoadingResume) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading resume data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{STEPS[currentStep].title}</span>
        </div>
      </div>
      
      {/* Step navigation buttons - Desktop */}
      <div className="hidden md:flex justify-between gap-4 border rounded-lg p-2 bg-gray-50">
        {STEPS.map((step, index) => (
          <Button
            key={step.id}
            variant={currentStep === index ? "default" : "ghost"}
            size="sm"
            className={`flex-1 ${currentStep === index ? "" : "text-muted-foreground"}`}
            onClick={() => goToStep(index)}
          >
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-xs">
              {index + 1}
            </span>
            {step.title}
          </Button>
        ))}
      </div>
      
      {/* Step navigation buttons - Mobile */}
      <div className="md:hidden border rounded-lg overflow-x-auto">
        <div className="flex min-w-max">
          {STEPS.map((step, index) => (
            <Button
              key={step.id}
              variant={currentStep === index ? "default" : "ghost"}
              size="sm"
              className={`flex-1 rounded-none ${currentStep === index ? "" : "text-muted-foreground"}`}
              onClick={() => goToStep(index)}
            >
              <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border bg-background text-xs">
                {index + 1}
              </span>
              {step.title}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Step content */}
      <Card className="p-6">
        {renderStepForm()}
      </Card>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous Step
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={saveResumeDraft}
            disabled={createResumeMutation.isPending || updateResumeMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createResumeMutation.isPending || updateResumeMutation.isPending ? "Saving..." : "Save Draft"}
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next Step
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={saveResumeDraft}
              disabled={createResumeMutation.isPending || updateResumeMutation.isPending}
            >
              {createResumeMutation.isPending || updateResumeMutation.isPending ? "Saving..." : "Complete"}
              <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}