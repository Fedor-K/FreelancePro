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
  FileText,
  DollarSign,
  Archive,
  Filter,
  Clock
} from "lucide-react";

export default function Projects() {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formProject, setFormProject] = useState<Project | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const isLoading = isLoadingProjects || isLoadingClients;

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

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };
  
  // Get project label based on status and dates
  const getProjectLabels = (project: Project): ProjectLabel[] => {
    const labels: ProjectLabel[] = [];
    
    if (project.invoiceSent) {
      labels.push("Invoice sent");
    }
    
    if (project.isPaid) {
      labels.push("Mark as paid");
    }
    
    if (project.deadline && isPast(new Date(project.deadline))) {
      labels.push("Past");
      
      if (project.status !== "Delivered" && project.status !== "Completed") {
        labels.push("Overdue");
      }
    }
    
    if (project.status === "In Progress") {
      labels.push("To be delivered");
    }
    
    if (project.deadline && !isPast(new Date(project.deadline)) && 
        differenceInDays(new Date(project.deadline), new Date()) <= 3) {
      labels.push("Deadline approaching");
    }
    
    if (!project.invoiceSent && 
        (project.status === "Delivered" || project.status === "Completed")) {
      labels.push("Make invoice");
    }
    
    return labels;
  };

  const handleEditProject = (project: Project) => {
    // Convert null values to undefined to match form schema
    const processedProject = {
      ...project,
      // Convert null boolean fields to false
      invoiceSent: project.invoiceSent === null ? false : project.invoiceSent,
      isPaid: project.isPaid === null ? false : project.isPaid,
      isArchived: project.isArchived === null ? false : project.isArchived,
      // Convert null string fields to empty strings
      description: project.description || "",
      sourceLang: project.sourceLang || "",
      targetLang: project.targetLang || "",
      // Keep numeric fields as is
    };
    
    setFormProject(processedProject as Project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/projects/${projectToDelete.id}`, undefined);
      
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      
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

  return (
    <div className="py-6">
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={showArchived}
                onCheckedChange={setShowArchived}
                id="show-archived"
              />
              <Label htmlFor="show-archived" className="text-sm">
                Show Archived
              </Label>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <ProjectForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Languages</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
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
                          <span 
                            className="font-medium block cursor-pointer hover:text-primary flex items-center"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            {project.name}
                            <ExternalLink className="ml-1 h-3 w-3 text-gray-400" />
                          </span>
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
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              // Toggle archive status
                              handleEditProject({
                                ...project,
                                isArchived: !project.isArchived
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
                            onClick={() => {
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
