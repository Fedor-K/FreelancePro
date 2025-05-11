import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface BasicInfoFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateFields: (fields: Record<string, any>) => void;
}

export default function BasicInfoForm({ formData, updateField, updateFields }: BasicInfoFormProps) {
  // Fetch user profile information to pre-populate the form
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: false, // Disable for now until we have the API endpoint
  });
  
  // Pre-populate form with user profile data when available
  useEffect(() => {
    if (profileData) {
      updateFields({
        name: profileData.name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        website: profileData.website || "",
        professionalTitle: profileData.jobTitle || "",
      });
    }
  }, [profileData, updateFields]);
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          This information will appear at the top of your resume
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Your phone number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="City, Country"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website">Website/Portfolio (optional)</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title</Label>
          <Input
            id="professionalTitle"
            value={formData.professionalTitle}
            onChange={(e) => updateField("professionalTitle", e.target.value)}
            placeholder="e.g. Freelance Translator"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Write a short summary of your skills and experience (2-4 sentences)"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          This appears at the top of your resume and gives recruiters a quick overview of your qualifications
        </p>
      </div>
    </div>
  );
}