import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Project } from "@shared/schema";

export function RecentProjects() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Get the most recent 4 projects
  const recentProjects = [...projects].sort((a, b) => {
    return new Date(b.deadline || 0).getTime() - new Date(a.deadline || 0).getTime();
  }).slice(0, 4);

  // Get client data for each project
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.company || client.name : "Unknown Client";
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
                        <StatusBadge status={project.status} />
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
