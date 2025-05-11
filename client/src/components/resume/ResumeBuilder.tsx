import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import BasicInfoForm from "./steps/BasicInfoForm";
import ProjectSelectionForm from "./steps/ProjectSelectionForm";
import SkillsExperienceForm from "./steps/SkillsExperienceForm";
import TargetPositionForm from "./steps/TargetPositionForm";
import PreviewExportForm from "./steps/PreviewExportForm";
import CoverLetterForm from "./steps/CoverLetterForm";

import { ChevronLeft, ChevronRight, Save, PlayCircle } from "lucide-react";

const STEPS = [
  { id: 'basic-info', title: 'Basic Information' },
  { id: 'projects', title: 'Project Selection' },
  { id: 'skills', title: 'Skills & Experience' },
  { id: 'target', title: 'Target Position' },
  { id: 'cover-letter', title: 'Cover Letter' },
  { id: 'preview', title: 'Preview & Export' },
];

export default function ResumeBuilder() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic information
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    professionalTitle: "",
    summary: "",
    
    // Projects
    selectedProjects: [],
    
    // Skills & Experience
    skills: [],
    languages: [],
    education: [],
    experience: [],
    
    // Target position
    targetCompany: "",
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
  
  // Save resume draft
  const saveResumeDraft = () => {
    // In a real implementation, we would save to localStorage or the database
    toast({
      title: "Resume draft saved",
      description: "Your resume draft has been saved successfully",
    });
  };
  
  // Render current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoForm 
            formData={formData} 
            updateField={updateField} 
            updateFields={updateFields} 
          />
        );
      case 1:
        return (
          <ProjectSelectionForm 
            formData={formData} 
            updateField={updateField} 
          />
        );
      case 2:
        return (
          <SkillsExperienceForm 
            formData={formData} 
            updateField={updateField} 
            updateFields={updateFields} 
          />
        );
      case 3:
        return (
          <TargetPositionForm 
            formData={formData} 
            updateField={updateField} 
          />
        );
      case 4:
        return (
          <CoverLetterForm 
            formData={formData} 
            updateField={updateField} 
          />
        );
      case 5:
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
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Next Step
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => toast({ title: "Resume completed!", description: "Your resume has been successfully created." })}>
              Complete
              <PlayCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}