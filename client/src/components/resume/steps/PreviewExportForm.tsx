import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Save, Copy, Eye, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PreviewExportFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function PreviewExportForm({ formData, updateField }: PreviewExportFormProps) {
  const { toast } = useToast();
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [resumeName, setResumeName] = useState(`Resume - ${new Date().toLocaleDateString()}`);
  
  // Handle resume template change
  const handleTemplateChange = (value: string) => {
    updateField("template", value);
  };
  
  // Handle resume save
  const handleSaveResume = () => {
    // In a real implementation, we would save the resume to the database
    toast({
      title: "Resume saved",
      description: "Your resume has been saved successfully",
    });
  };
  
  // Handle resume download
  const handleDownloadResume = () => {
    // In a real implementation, we would generate and download the PDF
    toast({
      title: "Download started",
      description: "Your resume is being prepared for download",
    });
  };
  
  // Handle resume copy to clipboard
  const handleCopyResume = () => {
    // In a real implementation, we would copy the resume content to clipboard
    toast({
      title: "Copied to clipboard",
      description: "Your resume content has been copied to clipboard",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Preview & Export</h2>
        <p className="text-sm text-muted-foreground">
          Review your resume, make final adjustments, and export it
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side - controls */}
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resume Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume-name">Resume Name</Label>
                <Input
                  id="resume-name"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  placeholder="Enter a name for your resume"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select 
                  value={formData.template} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 space-y-2">
                <Button 
                  className="w-full justify-start"
                  onClick={() => setIsEditingMode(!isEditingMode)}
                  variant="outline"
                >
                  {isEditingMode ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Mode
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Mode
                    </>
                  )}
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleSaveResume}
                  variant="outline"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Resume
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleDownloadResume}
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  onClick={handleCopyResume}
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resume Sections</CardTitle>
              <CardDescription>
                Toggle sections to show or hide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-summary" className="rounded" defaultChecked />
                  <Label htmlFor="show-summary">Professional Summary</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-skills" className="rounded" defaultChecked />
                  <Label htmlFor="show-skills">Skills</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-experience" className="rounded" defaultChecked />
                  <Label htmlFor="show-experience">Work Experience</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-projects" className="rounded" defaultChecked />
                  <Label htmlFor="show-projects">Projects</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-education" className="rounded" defaultChecked />
                  <Label htmlFor="show-education">Education</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-languages" className="rounded" defaultChecked />
                  <Label htmlFor="show-languages">Languages</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - resume preview */}
        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Resume Preview</span>
                <span className="text-sm font-normal text-muted-foreground">
                  Template: {formData.template.charAt(0).toUpperCase() + formData.template.slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[600px] overflow-auto p-0">
              {/* This would be replaced with an actual resume preview component */}
              <div className="p-8 bg-white min-h-full">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{formData.name || "Your Name"}</h1>
                  <p className="text-sm text-gray-600 mt-1">{formData.professionalTitle || "Professional Title"}</p>
                  <div className="flex justify-center text-xs text-gray-500 mt-2 gap-2">
                    {formData.email && <span>{formData.email}</span>}
                    {formData.phone && <span>• {formData.phone}</span>}
                    {formData.location && <span>• {formData.location}</span>}
                    {formData.website && <span>• {formData.website}</span>}
                  </div>
                </div>
                
                {/* Summary */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Professional Summary</h2>
                  <p className="text-sm text-gray-700">
                    {formData.summary || "Your professional summary will appear here. This should be a brief overview of your skills, experience, and career goals."}
                  </p>
                </div>
                
                {/* Skills */}
                {formData.skills && formData.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Work Experience */}
                {formData.experience && formData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Work Experience</h2>
                    <div className="space-y-4">
                      {formData.experience.map((exp: any, i: number) => (
                        <div key={i}>
                          <h3 className="text-md font-medium text-gray-800">{exp.role}</h3>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate} - {exp.endDate}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Projects */}
                {formData.selectedProjects && formData.selectedProjects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Projects</h2>
                    <div className="space-y-4">
                      {formData.selectedProjects.map((project: any, i: number) => (
                        <div key={i}>
                          <h3 className="text-md font-medium text-gray-800">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.sourceLang && project.targetLang && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                {project.sourceLang} → {project.targetLang}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {formData.education && formData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Education</h2>
                    <div className="space-y-3">
                      {formData.education.map((edu: any, i: number) => (
                        <div key={i}>
                          <h3 className="text-md font-medium text-gray-800">{edu.degree}</h3>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          {edu.year && <p className="text-xs text-gray-500">{edu.year}</p>}
                          {edu.description && (
                            <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Languages */}
                {formData.languages && formData.languages.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-1 mb-2">Languages</h2>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.languages.map((lang: any, i: number) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium text-gray-700">{lang.language}:</span>{" "}
                          <span className="text-gray-600">{lang.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}