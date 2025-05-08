import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProjectLabelBadge, LanguagePairBadge, ProjectLabel } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { format, isPast, differenceInDays, isToday } from "date-fns";
import { 
  ArrowLeft,
  ClipboardList, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  User,
  Building,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { Project, Client, Document } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Get project label based on status and dates
const getProjectLabels = (project: Project): ProjectLabel[] => {
  const labels: ProjectLabel[] = [];
  
  // Payment status labels
  if (project.invoiceSent) {
    labels.push("Invoice sent");
  }
  
  if (project.isPaid || project.status === "Paid") {
    labels.push("Paid" as ProjectLabel);
  }
  
  // Deadline and status labels
  if (project.deadline) {
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    
    if (isPast(deadlineDate) && !isToday(deadlineDate)) {
      // If deadline is in the past and project isn't complete, delivered, or paid
      if (project.status !== "Delivered" && 
          project.status !== "Completed" && 
          project.status !== "Paid" && 
          !project.isPaid) {
        labels.push("Overdue");
      }
    } else if (isToday(deadlineDate)) {
      // If deadline is today
      if (project.status !== "Paid" && !project.isPaid) {
        labels.push("To be delivered");
      }
    } else if (project.status !== "Delivered" && 
               project.status !== "Completed" && 
               project.status !== "Paid" && 
               !project.isPaid) {
      // If project is active and not yet due
      labels.push("In Progress" as ProjectLabel);
    }
  }
  
  // Show "Make invoice" for delivered/completed but not invoiced/paid projects
  if (!project.invoiceSent && 
      !project.isPaid && 
      project.status !== "Paid" && 
      (project.status === "Delivered" || project.status === "Completed")) {
    labels.push("Make invoice");
  }
  
  return labels;
};

export default function ProjectDetails() {
  const [_, navigate] = useLocation();
  const { projectId } = useParams();
  const id = projectId ? parseInt(projectId) : 0;
  
  console.log("ProjectDetails - Received projectId param:", projectId);
  console.log("ProjectDetails - Parsed ID:", id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch the specific project using ID in the URL
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !isNaN(id) && id > 0,
  });

  // Get client ID from project data
  const clientId = project?.clientId;
  
  // Fetch client data
  const { data: client, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    select: (docs) => docs.filter(doc => doc.projectId === id),
    enabled: !isNaN(id),
  });

  const isLoading = isLoadingProject || isLoadingClient || isLoadingDocuments;
  
  // Debug logging when project or client changes
  useEffect(() => {
    if (project) {
      console.log("Project data loaded:", project);
      console.log("Project ID:", project.id, typeof project.id);
    }
  }, [project]);
  
  useEffect(() => {
    if (client) {
      console.log("Client data loaded:", client);
    } else if (project?.clientId) {
      console.log("Client data not loaded yet, client ID:", project.clientId);
    }
  }, [client, project]);

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      await apiRequest("DELETE", `/api/projects/${project.id}`, undefined);
      
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      
      // Navigate back to projects list
      navigate("/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
          <p className="text-gray-500 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-full mr-2">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            {project.name}
            <StatusBadge status={project.status} className="ml-2" />
          </h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    Deadline
                  </span>
                  <span className="font-medium">
                    {project.deadline 
                      ? format(new Date(project.deadline), 'MMMM d, yyyy')
                      : "No deadline set"}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                    Amount
                  </span>
                  <span className="font-medium">
                    {project.amount 
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD'
                        }).format(project.amount)
                      : "Not specified"}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    Volume
                  </span>
                  <span className="font-medium">
                    {project.volume 
                      ? `${project.volume.toLocaleString()} characters`
                      : "Not specified"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                
                <div className="relative inline-block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 flex items-center">
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
                          onClick={() => {
                            if (status !== project.status) {
                              // Update project status
                              apiRequest("PATCH", `/api/projects/${project.id}`, {
                                status: status
                              }).then(() => {
                                // Invalidate queries to refresh data
                                queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                                queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
                                
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
                </div>
                
                <div className="flex flex-wrap gap-1 ml-2">
                  {getProjectLabels(project).map((label, idx) => (
                    <ProjectLabelBadge key={idx} label={label} />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Language pair:</span>
                {project.sourceLang && project.targetLang ? (
                  <LanguagePairBadge 
                    sourceLang={project.sourceLang}
                    targetLang={project.targetLang}
                  />
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </div>

              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-gray-700">{project.description || "No notes added to this project."}</p>
              </div>
              
              <Separator className="my-4" />
              
              {/* Documents Section */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Project Documents
                </h3>
                
                {documents.length === 0 ? (
                  <p className="text-gray-500">No documents created for this project yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <div>
                            <span className="font-medium">{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {doc.createdAt ? format(new Date(doc.createdAt), 'MMM d, yyyy') : ""}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/documents?id=${doc.id}`)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/documents?projectId=${project.id}`)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Document
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            {client ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-gray-100 rounded-full p-3 mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    {client.company && (
                      <p className="text-sm text-gray-500">{client.company}</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${client.email}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  
                  {client.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{client.company}</span>
                    </div>
                  )}
                  
                  {client.language && (
                    <div className="flex items-center">
                      <span className="mr-2">🌐</span>
                      <Badge variant="outline" className="text-xs">
                        {client.language}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/clients?id=${client.id}`)}
                  >
                    View Client Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Client information not available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Project Dialog */}
      {project && isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Make changes to your project below.</DialogDescription>
            
            <ProjectForm 
              defaultValues={{
                ...project,
                deadline: project.deadline 
                  ? new Date(project.deadline).toISOString().split('T')[0]
                  : "",
                // Convert null boolean fields to false
                invoiceSent: project.invoiceSent === null ? false : project.invoiceSent,
                isPaid: project.isPaid === null ? false : project.isPaid,
                isArchived: project.isArchived === null ? false : project.isArchived,
                // Convert null string fields to empty strings
                description: project.description || "",
                sourceLang: project.sourceLang || "",
                targetLang: project.targetLang || "",
                // Keep numeric fields as is
              }}
              projectId={project.id} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                // Force refetch project data after updating
                queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
                
                // Also invalidate client data as it might have changed
                if (clientId) {
                  queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}`] });
                }
                
                toast({
                  title: "Project updated",
                  description: "Project has been updated successfully."
                });
                
                // Reload the page to get fresh data
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {project && isDeleteDialogOpen && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently delete this project?
            </DialogDescription>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-center text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{project.name}</span>? 
              </p>
              <div className="flex justify-end w-full space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
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
      )}
    </div>
  );
}