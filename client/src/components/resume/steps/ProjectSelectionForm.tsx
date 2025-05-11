import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchX, Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup,
  CommandInput, 
  CommandItem,
  CommandList 
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Project } from "@shared/schema";

interface ProjectSelectionFormProps {
  formData: any;
  updateField: (field: string, value: any) => void;
}

export default function ProjectSelectionForm({ formData, updateField }: ProjectSelectionFormProps) {
  // States for the dropdown
  const [open, setOpen] = useState(false);
  
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
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="project-select">Select projects</Label>
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
          
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-auto py-3"
              >
                {formData.selectedProjects.length === 0 ? (
                  <span className="text-muted-foreground">Select projects to include in your resume</span>
                ) : (
                  <span className="font-medium">
                    {formData.selectedProjects.length} project{formData.selectedProjects.length !== 1 ? 's' : ''} selected
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search projects..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No projects found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {projects.map((project) => (
                      <CommandItem
                        key={project.id}
                        value={project.name}
                        onSelect={() => {
                          toggleProject(project);
                        }}
                        className="flex items-center gap-2 py-2 pl-2"
                      >
                        <Checkbox 
                          checked={isProjectSelected(project.id)}
                          className="mr-1"
                          onCheckedChange={() => toggleProject(project)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {formatProjectOption(project)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      {/* Selected projects preview */}
      {formData.selectedProjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Selected projects:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {formData.selectedProjects.map((project: Project) => (
              <div 
                key={project.id}
                className="flex items-center gap-2 p-2 border rounded-md hover:bg-accent"
              >
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => toggleProject(project)}
                >
                  <span className="sr-only">Remove</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}