import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
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
} from "lucide-react";
import { Project, Client, Document } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function ProjectDetails() {
  const [_, navigate] = useLocation();
  const { projectId } = useParams();
  const id = projectId ? parseInt(projectId) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: ['/api/projects', id],
    enabled: !isNaN(id),
  });

  const { data: client, isLoading: isLoadingClient } = useQuery<Client>({
    queryKey: ['/api/clients', project?.clientId],
    enabled: !!project?.clientId,
  });

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    select: (docs) => docs.filter(doc => doc.projectId === id),
    enabled: !isNaN(id),
  });

  const isLoading = isLoadingProject || isLoadingClient || isLoadingDocuments;

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
              <div className="grid grid-cols-2 gap-4">
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
            <ProjectForm 
              defaultValues={{
                ...project,
                deadline: project.deadline 
                  ? new Date(project.deadline).toISOString().split('T')[0]
                  : "",
              }}
              projectId={project.id} 
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
                toast({
                  title: "Project updated",
                  description: "Project has been updated successfully."
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      {project && isDeleteDialogOpen && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="p-3 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-center">Delete Project</h2>
              <p className="text-center text-gray-500">
                Are you sure you want to delete <span className="font-semibold">{project.name}</span>? 
                This action cannot be undone.
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