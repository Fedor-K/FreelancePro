import { useLocation } from "wouter";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ClipboardCheck } from "lucide-react";

export default function NewProject() {
  const [_, navigate] = useLocation();

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
            <BreadcrumbLink>New Project</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-full">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          Create New Project
        </h1>
        <p className="text-gray-500 mt-1">
          Add a new project to track your work, manage deadlines, and generate invoices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Fill in the details below to create a new project. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm 
            onSuccess={() => {
              navigate("/projects");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}