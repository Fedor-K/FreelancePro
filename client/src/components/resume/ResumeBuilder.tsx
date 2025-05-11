import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import BasicInfoForm from "./steps/BasicInfoForm";
import ProjectSelectionForm from "./steps/ProjectSelectionForm";
import SkillsExperienceForm from "./steps/SkillsExperienceForm";
import TargetPositionForm from "./steps/TargetPositionForm";
import PreviewExportForm from "./steps/PreviewExportForm";
import CoverLetterForm from "./steps/CoverLetterForm";

// Define the steps in the resume creation process
const steps = [
  { id: "basic-info", label: "Basic Information" },
  { id: "project-selection", label: "Select Projects" },
  { id: "skills-experience", label: "Skills & Experience" },
  { id: "target-position", label: "Target Position" },
  { id: "preview-export", label: "Preview & Export" },
  { id: "cover-letter", label: "Cover Letter (Optional)" }
];

// Initial form state
const initialFormState = {
  // Basic info
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
  education: [],
  languages: [],
  experience: [],
  
  // Target position
  jobDescription: "",
  targetCompany: "",
  
  // Resume settings
  template: "professional",
  
  // Cover letter
  coverLetter: ""
};

export default function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  
  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  // Handle form data changes
  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Handle multiple field updates at once
  const updateFormFields = (fields: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      ...fields
    }));
  };
  
  // Handle navigation between steps
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoForm 
          formData={formData} 
          updateField={updateFormData} 
          updateFields={updateFormFields} 
        />;
      case 1:
        return <ProjectSelectionForm 
          formData={formData} 
          updateField={updateFormData} 
        />;
      case 2:
        return <SkillsExperienceForm 
          formData={formData} 
          updateField={updateFormData} 
          updateFields={updateFormFields}
        />;
      case 3:
        return <TargetPositionForm 
          formData={formData} 
          updateField={updateFormData} 
        />;
      case 4:
        return <PreviewExportForm 
          formData={formData} 
          updateField={updateFormData} 
        />;
      case 5:
        return <CoverLetterForm 
          formData={formData} 
          updateField={updateFormData} 
        />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{steps[currentStep].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex space-x-2">
          {currentStep === steps.length - 1 ? (
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Resume & Cover Letter
            </Button>
          ) : (
            <Button onClick={goToNextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}