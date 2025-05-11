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
          
          {/* Search input */}
          <div className="relative">
            <Input
              placeholder="Search projects..."
              className="pl-9 mb-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchX className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Project dropdown list */}
          <div className="space-y-3">
            {projects
              .filter(project => 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
              )
              .map((project) => (
                <div key={project.id} className="mb-2">
                  <Select
                    onValueChange={(value) => {
                      if (value === "select") toggleProject(project);
                    }}
                    value={isProjectSelected(project.id) ? "select" : "unselect"}
                  >
                    <SelectTrigger className={`w-full text-left justify-between ${
                      isProjectSelected(project.id) ? 'ring-2 ring-primary' : ''
                    }`}>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={isProjectSelected(project.id)}
                          className="mr-2"
                          onCheckedChange={() => toggleProject(project)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium truncate">{project.name}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.status && renderStatusBadge(project.status)}
                            {project.sourceLang && project.targetLang && (
                              <Badge variant="outline" className="text-xs">
                                {project.sourceLang} → {project.targetLang}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={isProjectSelected(project.id) ? "select" : "unselect"}>
                        <div className="space-y-2 py-1">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Client ID: {project.clientId}
                            {project.description && <div className="mt-1">{project.description}</div>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
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
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              
            {/* Empty state */}
            {projects.filter(project => 
              project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
            ).length === 0 && (
              <div className="text-center py-6 text-muted-foreground border rounded-md">
                {searchTerm ? 
                  "No projects match your search. Try a different term." : 
                  "No projects available. Create some projects first."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Selected projects preview */}
      {formData.selectedProjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Selected projects:</h3>
          <div className="space-y-2">
            {formData.selectedProjects.map((project: Project) => (
              <div 
                key={project.id}
                className="flex flex-col border rounded-md overflow-hidden"
              >
                <div className={`py-3 px-4 ${project.status === "In Progress" ? "bg-purple-200" : project.status === "Delivered" ? "bg-yellow-100" : "bg-green-100"}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">{project.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full hover:bg-white/30"
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
                </div>
                <div className="px-4 py-2 bg-white flex items-center gap-3">
                  <Badge variant={project.status === "In Progress" ? "secondary" : project.status === "Delivered" ? "outline" : "default"} className="rounded-full">
                    {project.status}
                  </Badge>
                  
                  {project.deadline && (
                    <Badge variant="outline" className="rounded-full">
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </Badge>
                  )}
                  
                  {project.sourceLang && project.targetLang && (
                    <Badge variant="outline" className="rounded-full ml-auto">
                      {project.sourceLang} → {project.targetLang}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}