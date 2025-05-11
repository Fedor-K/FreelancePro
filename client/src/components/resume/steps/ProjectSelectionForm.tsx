import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchX, Check, ChevronsUpDown, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Project } from "@shared/schema";

interface ProjectSelectionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function ProjectSelectionForm({ formData, updateField }: ProjectSelectionFormProps) {
  // State for search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch projects from the API
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Handle project selection
  const toggleProject = (project: Project) => {
    const isSelected = formData.selectedProjects.some(
      (p: Project) => p.id === project.id
    );
    
    let newSelectedProjects;
    
    if (isSelected) {
      // Remove project if already selected
      newSelectedProjects = formData.selectedProjects.filter(
        (p: Project) => p.id !== project.id
      );
    } else {
      // Add project if not selected
      newSelectedProjects = [...formData.selectedProjects, project];
    }
    
    updateField("selectedProjects", newSelectedProjects);
  };
  
  // Note: Search functionality is now handled by the CommandInput component
  // This state is no longer needed but keeping it for compatibility
  const filteredProjects = projects;
  
  // Check if a project is selected
  const isProjectSelected = (projectId: number) => {
    return formData.selectedProjects.some((p: Project) => p.id === projectId);
  };
  
  // Get selected projects IDs as an array
  const getSelectedProjectIds = (): number[] => {
    return formData.selectedProjects.map((p: Project) => p.id);
  };
  
  // Handle multiple select change
  const handleSelectionChange = (selectedIds: number[]) => {
    if (!projects) return;
    
    // Create a new array of selected projects using the IDs
    const newSelectedProjects = projects
      .filter(project => selectedIds.includes(project.id));
      
    updateField("selectedProjects", newSelectedProjects);
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    let color = "bg-gray-100 text-gray-800";
    
    if (status === "In Progress") color = "bg-blue-100 text-blue-800";
    if (status === "Delivered") color = "bg-yellow-100 text-yellow-800";
    if (status === "Paid") color = "bg-green-100 text-green-800";
    
    return (
      <Badge className={color} variant="outline">
        {status}
      </Badge>
    );
  };
  
  // Format project option display
  const formatProjectOption = (project: Project) => {
    return (
      <div className="flex flex-col w-full py-1">
        <div className="font-medium">{project.name}</div>
        <div className="text-xs text-muted-foreground">
          Client ID: {project.clientId}
          {project.description && <span className="ml-2">- {project.description.substring(0, 50)}{project.description.length > 50 ? '...' : ''}</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {project.status && renderStatusBadge(project.status)}
          {project.deadline && (
            <Badge variant="outline" className="text-xs">
              {new Date(project.deadline).toLocaleDateString()}
            </Badge>
          )}
          {project.sourceLang && project.targetLang && (
            <Badge variant="outline" className="text-xs">
              {project.sourceLang} → {project.targetLang}
            </Badge>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">      
      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error loading projects</AlertTitle>
          <AlertDescription>
            There was a problem loading your projects. Please try again.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Project dropdown multi-select */}
      {!isLoading && !error && projects && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="project-select" className="text-base font-medium">Select projects to include in your resume</Label>
            {formData.selectedProjects.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => updateField("selectedProjects", [])}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          
          {/* Single dropdown with all projects */}
          <Select 
            onValueChange={(value) => {
              const project = projects.find(p => p.id === parseInt(value));
              if (project) toggleProject(project);
            }}
          >
            <SelectTrigger className="w-full flex items-center justify-between p-0 pr-3 overflow-hidden">
              {formData.selectedProjects.length > 0 ? (
                <div className="flex-1 flex items-center">
                  <div className="flex-shrink-0 pl-2 pr-3">
                    <Checkbox checked={true} className="pointer-events-none" />
                  </div>
                  <div className="py-2.5">
                    <div className="font-medium">{formData.selectedProjects[0].name}</div>
                    <div className="flex items-center mt-1 gap-3 text-sm">
                      <span className={`py-0.5 px-2 rounded-full text-xs
                        ${formData.selectedProjects[0].status === "In Progress" ? 
                          "bg-blue-100 text-blue-700" : 
                          formData.selectedProjects[0].status === "Delivered" ? 
                            "bg-yellow-100 text-yellow-700" : 
                            "bg-green-100 text-green-700"
                        }`}
                      >
                        {formData.selectedProjects[0].status}
                      </span>
                      
                      {formData.selectedProjects[0].deadline && (
                        <span className="text-xs text-gray-600">
                          {new Date(formData.selectedProjects[0].deadline).toLocaleDateString('en-US', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      )}
                      
                      {formData.selectedProjects[0].sourceLang && formData.selectedProjects[0].targetLang && (
                        <span className="text-xs text-gray-600 ml-auto">
                          {formData.selectedProjects[0].sourceLang} → {formData.selectedProjects[0].targetLang}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <SelectValue placeholder="Choose Project" />
              )}
            </SelectTrigger>
            <SelectContent className="max-h-[400px]">
              {/* Search input inside dropdown */}
              <div className="p-2 border-b">
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
              </div>
              
              <SelectGroup>
                {projects
                  .filter(project => 
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .map((project) => (
                    <SelectItem 
                      key={project.id} 
                      value={project.id.toString()}
                      className="focus:bg-accent cursor-pointer p-0"
                    >
                      <div className="flex items-center w-full py-2" onClick={(e) => {
                        e.stopPropagation();
                        toggleProject(project);
                      }}>
                        <div className="flex-shrink-0 pl-2 pr-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={isProjectSelected(project.id)}
                            onCheckedChange={() => toggleProject(project)}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Client ID: {project.clientId}
                            {project.description && <span className="ml-1">- {project.description.substring(0, 40)}{project.description.length > 40 ? '...' : ''}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center pl-10 pb-2 pr-2 gap-3 -mt-1 text-sm">
                        {project.status && (
                          <span className={`py-0.5 px-2 rounded-full text-xs
                            ${project.status === "In Progress" ? 
                              "bg-blue-100 text-blue-700" : 
                              project.status === "Delivered" ? 
                                "bg-yellow-100 text-yellow-700" : 
                                "bg-green-100 text-green-700"
                            }`}
                          >
                            {project.status}
                          </span>
                        )}
                        
                        {project.deadline && (
                          <span className="text-xs text-gray-600">
                            {new Date(project.deadline).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit', 
                              year: 'numeric'
                            })}
                          </span>
                        )}
                        
                        {project.sourceLang && project.targetLang && (
                          <span className="text-xs text-gray-600 ml-auto">
                            {project.sourceLang} → {project.targetLang}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectGroup>
              
              {/* Empty state */}
              {projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 
                    "No projects match your search. Try a different term." : 
                    "No projects available. Create some projects first."}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Selected projects preview */}
      {formData.selectedProjects.length > 0 && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-medium">Selected projects:</h3>
          <div className="space-y-2">
            {formData.selectedProjects.map((project: Project) => (
              <div 
                key={project.id}
                className="flex flex-col border rounded-md overflow-hidden bg-purple-50"
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-base">{project.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full hover:bg-white/30 text-gray-500"
                        onClick={() => toggleProject(project)}
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Client ID: {project.clientId} {project.description ? `- ${project.description}` : ''}</p>
                    
                    <div className="flex items-center mt-3 gap-3 text-sm">
                      <span 
                        className={`py-1 px-2.5 rounded-full 
                          ${project.status === "In Progress" ? 
                            "bg-blue-100 text-blue-700" : 
                            project.status === "Delivered" ? 
                              "bg-yellow-100 text-yellow-700" : 
                              "bg-green-100 text-green-700"
                          }`}
                      >
                        {project.status}
                      </span>
                      
                      {project.deadline && (
                        <span className="text-gray-600">
                          {new Date(project.deadline).toLocaleDateString('en-US', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </span>
                      )}
                      
                      {project.sourceLang && project.targetLang && (
                        <span className="text-gray-600 ml-auto">
                          {project.sourceLang} → {project.targetLang}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}