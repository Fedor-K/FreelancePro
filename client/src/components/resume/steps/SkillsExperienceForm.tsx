import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X, GripVertical, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SkillsExperienceFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
  updateFields: (fields: Record<string, any>) => void;
}

export default function SkillsExperienceForm({ 
  formData, 
  updateField, 
  updateFields 
}: SkillsExperienceFormProps) {
  const [skill, setSkill] = useState("");
  const [language, setLanguage] = useState("");
  const [languageLevel, setLanguageLevel] = useState("");
  
  // Manage education entries
  const [education, setEducation] = useState({
    degree: "",
    institution: "",
    year: "",
    description: ""
  });
  
  // Manage experience entries
  const [experience, setExperience] = useState({
    role: "",
    company: "",
    startDate: "",
    endDate: "",
    description: ""
  });
  
  // Add a new skill
  const addSkill = () => {
    if (skill.trim()) {
      const updatedSkills = [...formData.skills, skill.trim()];
      updateField("skills", updatedSkills);
      setSkill("");
    }
  };
  
  // Remove a skill
  const removeSkill = (index: number) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    updateField("skills", updatedSkills);
  };
  
  // Add a new language
  const addLanguage = () => {
    if (language.trim() && languageLevel.trim()) {
      const newLanguage = {
        language: language.trim(),
        level: languageLevel.trim()
      };
      const updatedLanguages = [...formData.languages, newLanguage];
      updateField("languages", updatedLanguages);
      setLanguage("");
      setLanguageLevel("");
    }
  };
  
  // Remove a language
  const removeLanguage = (index: number) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages.splice(index, 1);
    updateField("languages", updatedLanguages);
  };
  
  // Add education entry
  const addEducation = () => {
    if (education.degree.trim() && education.institution.trim()) {
      const updatedEducation = [...formData.education, {...education}];
      updateField("education", updatedEducation);
      setEducation({
        degree: "",
        institution: "",
        year: "",
        description: ""
      });
    }
  };
  
  // Remove education entry
  const removeEducation = (index: number) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    updateField("education", updatedEducation);
  };
  
  // Add experience entry
  const addExperience = () => {
    if (experience.role.trim() && experience.company.trim()) {
      const updatedExperience = [...formData.experience, {...experience}];
      updateField("experience", updatedExperience);
      setExperience({
        role: "",
        company: "",
        startDate: "",
        endDate: "",
        description: ""
      });
    }
  };
  
  // Remove experience entry
  const removeExperience = (index: number) => {
    const updatedExperience = [...formData.experience];
    updatedExperience.splice(index, 1);
    updateField("experience", updatedExperience);
  };
  
  return (
    <div className="space-y-8">
      {/* Skills Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        
        {/* Skills input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Add a skill (e.g., Translation, Editing, Localization)"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <Button onClick={addSkill} type="button">
            Add
          </Button>
        </div>
        
        {/* Skills list */}
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map((skill: string, index: number) => (
            <Badge 
              key={index} 
              className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary"
              variant="outline"
            >
              {skill}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => removeSkill(index)}
              />
            </Badge>
          ))}
          {formData.skills.length === 0 && (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
      </div>
      
      {/* Languages Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Languages</h2>
        
        {/* Language input */}
        <div className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Language (e.g., English, Spanish)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Proficiency (e.g., Native, Fluent, Intermediate)"
            value={languageLevel}
            onChange={(e) => setLanguageLevel(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addLanguage} type="button">
            Add
          </Button>
        </div>
        
        {/* Languages list */}
        <div className="space-y-2">
          {formData.languages.map((lang: any, index: number) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-muted/30 p-2 rounded"
            >
              <span>
                <span className="font-medium">{lang.language}</span> - {lang.level}
              </span>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => removeLanguage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {formData.languages.length === 0 && (
            <p className="text-sm text-muted-foreground">No languages added yet</p>
          )}
        </div>
      </div>
      
      {/* Education Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Education</h2>
        
        {/* Education input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Degree/Certification"
                value={education.degree}
                onChange={(e) => setEducation({...education, degree: e.target.value})}
              />
              <Input
                placeholder="Institution"
                value={education.institution}
                onChange={(e) => setEducation({...education, institution: e.target.value})}
              />
              <Input
                placeholder="Year"
                value={education.year}
                onChange={(e) => setEducation({...education, year: e.target.value})}
              />
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={education.description}
              onChange={(e) => setEducation({...education, description: e.target.value})}
              rows={2}
            />
            <Button onClick={addEducation} type="button" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </CardContent>
        </Card>
        
        {/* Education list */}
        <ScrollArea className="h-60 rounded-md border">
          <div className="p-4 space-y-4">
            {formData.education.map((edu: any, index: number) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{edu.degree}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">
                      {edu.institution} {edu.year && `• ${edu.year}`}
                    </p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                {edu.description && (
                  <CardContent className="pb-3 pt-0">
                    <p className="text-sm">{edu.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {formData.education.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No education entries added yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Work Experience Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        
        {/* Experience input */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Work Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Role/Position"
                value={experience.role}
                onChange={(e) => setExperience({...experience, role: e.target.value})}
              />
              <Input
                placeholder="Company/Organization"
                value={experience.company}
                onChange={(e) => setExperience({...experience, company: e.target.value})}
              />
              <Input
                placeholder="Start Date"
                value={experience.startDate}
                onChange={(e) => setExperience({...experience, startDate: e.target.value})}
              />
              <Input
                placeholder="End Date (or 'Present')"
                value={experience.endDate}
                onChange={(e) => setExperience({...experience, endDate: e.target.value})}
              />
            </div>
            <Textarea
              placeholder="Description (achievements, responsibilities)"
              value={experience.description}
              onChange={(e) => setExperience({...experience, description: e.target.value})}
              rows={3}
            />
            <Button onClick={addExperience} type="button" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </CardContent>
        </Card>
        
        {/* Experience list */}
        <ScrollArea className="h-60 rounded-md border">
          <div className="p-4 space-y-4">
            {formData.experience.map((exp: any, index: number) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-base">{exp.role}</CardTitle>
                    <p className="text-sm font-medium text-muted-foreground">
                      {exp.company}
                      {(exp.startDate || exp.endDate) && 
                        ` • ${exp.startDate || ""} ${
                          exp.startDate && exp.endDate ? "to" : ""
                        } ${exp.endDate || ""}`
                      }
                    </p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                {exp.description && (
                  <CardContent className="pb-3 pt-0">
                    <p className="text-sm">{exp.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            {formData.experience.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No experience entries added yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}