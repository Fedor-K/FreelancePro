import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TargetPositionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function TargetPositionForm({ formData, updateField }: TargetPositionFormProps) {
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
      </div>
      
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