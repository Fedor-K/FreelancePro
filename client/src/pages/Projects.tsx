import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge, ProjectLabelBadge, LanguagePairBadge, ProjectLabel } from "@/components/ui/status-badge";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Project, Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format, isPast, differenceInDays } from "date-fns";
import { 
  ClipboardList, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  X,
  Plus,
  ExternalLink,
  Archive,
  Filter,
  ChevronDown
} from "lucide-react";

export default function Projects() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  
  // State for edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formProject, setFormProject] = useState<Project | null>(null);
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  
  // Fetch projects data
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch clients data
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Get project labels based on status and deadline
  const getProjectLabels = (project: Project): ProjectLabel[] => {
    const labels: ProjectLabel[] = [];
    
    // If project is paid, that's the only label that matters
    if (project.isPaid) {
      labels.push("Paid");
      return labels;
    }
    
    // Check invoice status
    if (project.invoiceSent) {
      labels.push("Invoice sent");
    }
    
    // Check deadline status
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      
      if (isPast(deadlineDate)) {
        // If deadline is in the past
        labels.push("Overdue");
      } else {
        // If deadline is approaching (less than 7 days)
        const daysToDeadline = differenceInDays(deadlineDate, new Date());
        if (daysToDeadline <= 7) {
          labels.push("To be delivered");
        }
      }
    }
    
    // Add in-progress label
    if (project.status === "In Progress") {
      labels.push("In Progress");
    }
    
    return labels;
  };
  
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company || client.name : "Unknown Client";
  };
  
  const handleEditProject = (project: Project) => {
    setFormProject(project);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/projects/${projectToDelete.id}`);
      
      // Close the dialog and reset state
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter projects based on search term and archived status
  const filteredProjects = projects.filter(project => {
    // Filter by archived status
    if (!showArchived && project.isArchived) return false;
    
    // Filter by search term
    return (
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getClientName(project.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <ProjectForm 
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="my-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 pr-4" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7" 
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              id="archived" 
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="archived" className="text-sm">Show archived</Label>
          </div>
        </div>
      </div>
      
      <Card className="mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    Loading projects...
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    {searchTerm 
                      ? "No projects match your search. Try a different term."
                      : showArchived 
                        ? "No archived projects found."
                        : "No projects found. Add a project to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    className={project.isArchived ? "bg-gray-50" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-medium text-sm cursor-pointer hover:text-primary flex items-center"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            {project.name}
                            <ExternalLink className="ml-1 h-3 w-3 text-gray-400" />
                          </Button>
                          {project.description && (
                            <span className="text-xs text-gray-500">
                              {project.description.length > 40 
                                ? `${project.description.slice(0, 40)}...` 
                                : project.description}
                            </span>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getProjectLabels(project).map((label, idx) => (
                              <ProjectLabelBadge key={idx} label={label} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getClientName(project.clientId)}</TableCell>
                    <TableCell>
                      {project.sourceLang && project.targetLang ? (
                        <LanguagePairBadge 
                          sourceLang={project.sourceLang}
                          targetLang={project.targetLang}
                        />
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {project.volume ? (
                        <span>{project.volume.toLocaleString()} chars</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {project.amount 
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(project.amount)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {project.deadline 
                        ? format(new Date(project.deadline), 'MMM d, yyyy')
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="p-0 flex items-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <StatusBadge status={project.status} />
                            <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40">
                          <div className="px-2 py-1.5 text-sm font-medium">Change Status</div>
                          <DropdownMenuSeparator />
                          {["Not started", "In Progress", "Delivered", "Completed", "Paid"].map((status) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={(e) => {
                                // Prevent event bubbling to parent elements
                                e.preventDefault();
                                e.stopPropagation();
                                
                                if (status !== project.status) {
                                  // Update project status directly via API
                                  apiRequest("PATCH", `/api/projects/${project.id}`, {
                                    status: status
                                  }).then(() => {
                                    // Invalidate queries to refresh data
                                    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                                    
                                    toast({
                                      title: "Status updated",
                                      description: `Project status changed to ${status}`,
                                    });
                                  }).catch(error => {
                                    toast({
                                      title: "Error",
                                      description: "Failed to update status. Please try again.",
                                      variant: "destructive",
                                    });
                                  });
                                }
                              }}
                              className={project.status === status ? "bg-gray-100" : ""}
                            >
                              <StatusBadge status={status as any} className="mr-2" />
                              <span>{status}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEditProject(project);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Toggle archive status directly via API
                              apiRequest("PATCH", `/api/projects/${project.id}`, {
                                isArchived: !project.isArchived
                              }).then(() => {
                                // Invalidate queries to refresh data
                                queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                                
                                toast({
                                  title: project.isArchived ? "Project unarchived" : "Project archived",
                                  description: project.isArchived ? 
                                    "Project has been moved to active projects." : 
                                    "Project has been archived."
                                });
                              }).catch(error => {
                                toast({
                                  title: "Error",
                                  description: "Failed to update project. Please try again.",
                                  variant: "destructive",
                                });
                              });
                            }}
                          >
                            {project.isArchived ? (
                              <>
                                <Archive className="mr-2 h-4 w-4" />
                                Unarchive
                              </>
                            ) : (
                              <>
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setProjectToDelete(project);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Edit Project Dialog */}
      {formProject && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <ProjectForm 
              defaultValues={{
                ...formProject,
                deadline: formProject.deadline 
                  ? new Date(formProject.deadline).toISOString().split('T')[0]
                  : "",
                // Convert null boolean fields to false
                invoiceSent: formProject.invoiceSent === null ? false : formProject.invoiceSent,
                isPaid: formProject.isPaid === null ? false : formProject.isPaid,
                isArchived: formProject.isArchived === null ? false : formProject.isArchived,
                // Convert null string fields to empty strings
                description: formProject.description || "",
                sourceLang: formProject.sourceLang || "",
                targetLang: formProject.targetLang || "",
                // Keep numeric fields as is
              }}
              projectId={formProject.id}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setFormProject(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-center">Delete Project</h2>
            <p className="text-center text-gray-500">
              Are you sure you want to delete <span className="font-semibold">{projectToDelete?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end w-full space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteProject}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}