import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface ProjectsSelectorProps {
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
}

export function ProjectsSelector({ selectedProjects, onProjectsChange }: ProjectsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [projectEntries, setProjectEntries] = useState<string[]>(selectedProjects);
  
  // Query to get projects from the API
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  useEffect(() => {
    // Update local state when selectedProjects changes from outside
    setProjectEntries(selectedProjects);
  }, [selectedProjects]);
  
  // Handle toggling a project selection
  const toggleProject = (project: Project) => {
    const formattedProject = formatProjectDescription(project);
    
    let newProjects: string[];
    
    if (projectEntries.includes(formattedProject)) {
      // Remove project if already selected
      newProjects = projectEntries.filter(p => p !== formattedProject);
    } else {
      // Add project if not already selected
      newProjects = [...projectEntries, formattedProject];
    }
    
    setProjectEntries(newProjects);
    onProjectsChange(newProjects);
  };
  
  // Helper to format project description
  const formatProjectDescription = (project: Project): string => {
    let clientName = "Unknown Client";
    const client = projects.find(c => c.id === project.clientId);
    if (client) {
      clientName = client.name;
    }
    
    return `${project.name} for ${clientName} - ${project.description || "No description"}`;
  };
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
          >
            {projectEntries.length > 0 
              ? `${projectEntries.length} projects selected` 
              : "Select projects..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search projects..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup heading="Your Projects">
                {projects.map((project) => {
                  const formattedProject = formatProjectDescription(project);
                  const isSelected = projectEntries.includes(formattedProject);
                  
                  return (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => toggleProject(project)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-grow truncate">
                        <span className="font-medium">{project.name}</span>
                        <span className="ml-2 text-muted-foreground text-xs">
                          {project.status}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected Projects Badges */}
      <div className="flex flex-wrap gap-1">
        {projectEntries.length > 0 && (
          projectEntries.map((project, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="text-xs"
            >
              {project.length > 50 ? project.substring(0, 50) + '...' : project}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}