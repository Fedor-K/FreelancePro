import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isPast, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, ProjectLabelBadge, type ProjectLabel } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Plus, ArrowRight, ChevronDown, Receipt } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Project } from "@shared/schema";

export function RecentProjects() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

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

  // Get the most urgent 4 projects based on deadline and status
  const recentProjects = [...projects]
    .sort((a, b) => getProjectUrgencyScore(a) - getProjectUrgencyScore(b))
    .slice(0, 4);

  // Get client data for each project
  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company || client.name : "Unknown Client";
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
        // If deadline is in the past and project is in progress
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

  const handleSuccess = () => {
    setIsDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <ProjectForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <ul className="divide-y divide-gray-200">
          {recentProjects.length > 0 ? (
            recentProjects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <div>
                          <p className="text-sm font-medium text-primary truncate">{project.name}</p>
                          <p className="mt-1 text-sm text-gray-500 truncate">{getClientName(project.clientId)}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {getProjectLabels(project).map((label, idx) => (
                              <ProjectLabelBadge key={idx} label={label} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${project.amount?.toFixed(2) ?? '0.00'}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {project.deadline 
                              ? `Due ${format(new Date(project.deadline), 'MMM d, yyyy')}` 
                              : 'No deadline'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={project.status} />
                          
                          {/* Show Send Invoice button for delivered projects without invoices and not paid */}
                          {project.status === "Delivered" && !project.invoiceSent && !project.isPaid && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs py-1 h-6 border-blue-400 text-blue-600 hover:bg-blue-50"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Navigate to documents page with query params to create invoice
                                navigate(`/documents?projectId=${project.id}&type=invoice`);
                              }}
                            >
                              <Receipt className="h-3 w-3" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="py-8 text-center text-gray-500">
              No projects found. Create a new project to get started.
            </li>
          )}
        </ul>
      </Card>
      
      <div className="mt-4 text-right">
        <Link href="/projects" className="text-sm font-medium text-primary hover:text-blue-700 flex items-center justify-end">
          View all projects <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
