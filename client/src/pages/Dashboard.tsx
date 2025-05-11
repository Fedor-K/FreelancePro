import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  FileText,
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  X,
  Plus,
  ExternalLink,
  Archive,
  Filter,
  Clock,
  ChevronDown,
  Receipt
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Project, Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { format, isPast, isToday, differenceInDays, isEqual } from "date-fns";

interface DashboardStats {
  activeClients: number;
  ongoingProjects: number;
  monthlyRevenue: number;
  documentsGenerated: number;
}

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [formProject, setFormProject] = useState<Project | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Define a type for the tab values based on projectStatusEnum
  type TabValue = "In Progress" | "Delivered" | "Paid";
  const [activeTab, setActiveTab] = useState<TabValue>("In Progress");

  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });
  
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const isLoading = isLoadingStats || isLoadingProjects || isLoadingClients;

  // Function to get project urgency score (lower = more urgent)
  const getProjectUrgencyScore = (project: Project): number => {
    // Paid projects have lowest priority
    if (project.isPaid || project.status === "Paid") {
      return Number.MAX_SAFE_INTEGER;
    }
    
    // Delivered projects have second lowest priority
    if (project.status === "Delivered") {
      return Number.MAX_SAFE_INTEGER - 1;
    }
    
    // If no deadline, it's less urgent than any deadline
    if (!project.deadline) {
      return Number.MAX_SAFE_INTEGER - 2;
    }
    
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    
    // Calculate days until deadline (negative for past deadlines)
    const daysToDeadline = Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Overdue projects are most urgent (more overdue = more urgent)
    if (daysToDeadline < 0) {
      return daysToDeadline; // Negative number, so lower = more overdue
    }
    
    // For future deadlines, return days until deadline
    return daysToDeadline;
  };

  // Get counts for tabs
  const inProgressCount = projects.filter(p => p.status === "In Progress").length;
  const deliveredCount = projects.filter(p => p.status === "Delivered").length;
  const paidCount = projects.filter(p => p.status === "Paid").length;
  
  // Filter projects based on search term and active tab
  const filteredProjects = projects
    .filter(project => {
      // Filter by active tab
      if (project.status !== activeTab) return false;
      
      // Filter by search term
      return (
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (getClientName(project.clientId).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    // Sort by urgency (overdue first, then by closest deadline)
    .sort((a, b) => getProjectUrgencyScore(a) - getProjectUrgencyScore(b));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };
  
  // Get project label based on status and dates
  const getProjectLabels = (project: Project): ProjectLabel[] => {
    const labels: ProjectLabel[] = [];
    
    // If project is paid, that's the only label that matters
    if (project.isPaid || project.status === "Paid") {
      labels.push("Paid");
      return labels;
    }
    
    // Show "Pending payment" status for delivered and invoice sent
    if (project.invoiceSent && project.status === "Delivered") {
      labels.push("Pending payment");
      return labels;
    }
    
    // Check deadline status
    if (project.deadline) {
      const deadlineDate = new Date(project.deadline);
      const today = new Date();
      
      if (isPast(deadlineDate) && !isToday(deadlineDate)) {
        // If deadline is in the past and project isn't delivered or paid
        if (project.status === "In Progress" && !project.isPaid) {
          labels.push("Overdue");
          return labels;
        }
      }
    }
    
    // If nothing else applies and status is In Progress, show that
    if (project.status === "In Progress") {
      labels.push("In Progress");
    }
    
    return labels;
  };

  const handleEditProject = (project: Project) => {
    setFormProject(project);
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900"></h1>
      </div>
      
      {/* Display amounts from In Progress and Delivered projects */}
      <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2">
        {isLoadingProjects ? (
          // Loading skeletons for stats
          [...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden bg-white rounded-lg shadow">
              <CardContent className="p-5">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="flex-1 w-0 ml-5">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Only show amounts from projects
          <>
            <StatsCard
              title="In Progress Amount"
              value={formatCurrency(projects.filter(p => p.status === "In Progress").reduce((sum, project) => sum + (project.amount || 0), 0))}
              icon={ClipboardList}
              iconColor="#975A16"
              iconBgColor="#FEFCBF"
            />
            <StatsCard
              title="Delivered Amount"
              value={formatCurrency(projects.filter(p => p.status === "Delivered").reduce((sum, project) => sum + (project.amount || 0), 0))}
              icon={DollarSign}
              iconColor="#48BB78"
              iconBgColor="#C6F6D5"
            />
          </>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-72">
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
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">

            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add details for your new project. Fill in all required fields.
                </DialogDescription>
                <ProjectForm onSuccess={() => setIsAddDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="In Progress" value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="In Progress">
              In Progress
              <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-yellow-100 px-2 text-xs font-medium text-yellow-800">
                {inProgressCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="Delivered">
              Delivered
              <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-blue-100 px-2 text-xs font-medium text-blue-800">
                {deliveredCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="Paid">
              Paid
              <span className="ml-1 inline-flex h-5 items-center justify-center rounded-full bg-green-100 px-2 text-xs font-medium text-green-800">
                {paidCount}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
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
                        : `No ${activeTab} projects found.${activeTab === "In Progress" ? " Add a project to get started." : ""}`}
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
                        <div className="relative inline-block">
                          <div className="flex items-center gap-2">
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
                              <DropdownMenuContent className="w-40" onClick={(e) => e.stopPropagation()}>
                                <div className="px-2 py-1.5 text-sm font-medium">Change Status</div>
                                <DropdownMenuSeparator />
                                {["In Progress", "Delivered", "Paid"].map((status) => (
                                  <DropdownMenuItem 
                                    key={status}
                                    onClick={(e) => {
                                      // Prevent event bubbling
                                      e.preventDefault();
                                      e.stopPropagation();
                                      
                                      if (status !== project.status) {
                                        // Update project status directly via API
                                        apiRequest("PATCH", `/api/projects/${project.id}`, {
                                          status: status
                                        }).then(() => {
                                          // Invalidate queries to refresh data
                                          queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                                          queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
                                          
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
                            
                            {/* Show Send Invoice button for delivered projects without invoices and not paid */}
                            {project.status === "Delivered" && !project.invoiceSent && !project.isPaid && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex items-center gap-1 text-xs py-1 h-7 border-blue-400 text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  // Navigate to documents page with query params to create invoice
                                  navigate(`/documents?projectId=${project.id}&type=invoice`);
                                }}
                              >
                                <Receipt className="h-3 w-3" />
                                Send Invoice
                              </Button>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigate(`/projects/${project.id}`);
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
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
          <div className="flex justify-center mt-4 pb-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/projects')}
            >
              Show All Projects
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Edit Project Dialog */}
      {formProject && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the details of your project.
            </DialogDescription>
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
