import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Project } from "@shared/schema";

interface ProjectSelectionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function ProjectSelectionForm({ formData, updateField }: ProjectSelectionFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch projects from the API
  const { data: projects, isLoading, error } = useQuery<Project[]>({
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
  
  // Filter projects based on search term
  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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
      {/* Search input */}
      <div className="relative">
        <Input 
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      
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
      
      {/* No results */}
      {filteredProjects && filteredProjects.length === 0 && (
        <Alert>
          <SearchX className="h-4 w-4" />
          <AlertTitle>No matching projects</AlertTitle>
          <AlertDescription>
            No projects match your search. Try different keywords or clear the search.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Project dropdown multi-select */}
      {filteredProjects && filteredProjects.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="project-select">Select projects</Label>
          <div className="border rounded-md divide-y">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer ${
                  isProjectSelected(project.id) ? "bg-primary/5 border-primary" : ""
                }`}
                onClick={() => toggleProject(project)}
              >
                <Checkbox 
                  id={`project-${project.id}`}
                  checked={isProjectSelected(project.id)}
                  onCheckedChange={() => toggleProject(project)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  {formatProjectOption(project)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected projects counter */}
      <div className="text-sm font-medium">
        {formData.selectedProjects.length} projects selected
      </div>
    </div>
  );
}