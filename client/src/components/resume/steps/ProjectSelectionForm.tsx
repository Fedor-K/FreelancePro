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
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
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
      
      {/* Project list */}
      <div className="space-y-3">
        {filteredProjects?.map(project => (
          <Card 
            key={project.id} 
            className={`${
              isProjectSelected(project.id) 
                ? "border-primary bg-primary/5" 
                : ""
            } cursor-pointer transition-colors`}
            onClick={() => toggleProject(project)}
          >
            <CardHeader className="pb-2 flex flex-row items-center gap-4">
              <div className="flex-1">
                <CardTitle className="text-base">{project.name}</CardTitle>
                {project.clientId && (
                  <CardDescription>
                    Client ID: {project.clientId}
                  </CardDescription>
                )}
              </div>
              <Checkbox 
                checked={isProjectSelected(project.id)}
                onCheckedChange={() => toggleProject(project)}
                onClick={(e) => e.stopPropagation()}
              />
            </CardHeader>
            <CardContent className="pb-2">
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="flex flex-wrap gap-2 text-xs">
                {project.status && renderStatusBadge(project.status)}
                {project.deadline && (
                  <Badge variant="outline">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </Badge>
                )}
                {project.sourceLang && project.targetLang && (
                  <Badge variant="outline">
                    {project.sourceLang} → {project.targetLang}
                  </Badge>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Selected projects counter */}
      <div className="text-sm font-medium">
        {formData.selectedProjects.length} projects selected
      </div>
    </div>
  );
}