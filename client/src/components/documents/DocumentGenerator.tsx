import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, FileText, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Project, Document as DocumentType, Client } from "@shared/schema";
import { generateDocument, exportToPdf, copyToClipboard } from "@/lib/docGenerator";
import { apiRequest } from "@/lib/queryClient";

// Form schema for document generation
const formSchema = z.object({
  type: z.enum(["invoice", "contract"], {
    required_error: "Please select a document type",
  }),
  projectId: z.string({
    required_error: "Please select a project",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState("form");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch projects for the select dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch clients to display project client names
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  // Parse query parameters
  console.log("Location:", location);
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  console.log("Search params:", Object.fromEntries(searchParams.entries()));
  const projectIdParam = searchParams.get("projectId");
  const typeParam = searchParams.get("type") as "invoice" | "contract" | null;
  console.log("Extracted params:", { projectIdParam, typeParam });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: typeParam || "invoice",
      projectId: projectIdParam || "",
    },
  });
  
  // Effect to handle form pre-population from URL parameters
  useEffect(() => {
    console.log("DocumentGenerator - projects loaded:", projects.length > 0);
    console.log("DocumentGenerator - projectIdParam:", projectIdParam);
    console.log("DocumentGenerator - Form current values:", form.getValues());

    if (projects.length > 0 && projectIdParam) {
      console.log("DocumentGenerator - All projects:", projects);
      const project = projects.find(p => p.id.toString() === projectIdParam);
      console.log("DocumentGenerator - Project match attempt:", { projectIdParam, found: !!project });
      
      if (project) {
        // Check if this project is valid for the current document type
        const currentType = form.getValues().type || typeParam || "invoice";
        const isValidForType = currentType !== "invoice" || 
          (project.status === "Delivered" && !project.invoiceSent && !project.isPaid);
          
        if (isValidForType) {
          console.log("DocumentGenerator - Project found and valid for type:", project);
          // Set local state
          setSelectedProject(projectIdParam);
          
          // Set form values
          console.log("DocumentGenerator - Setting projectId to:", projectIdParam);
          form.setValue("projectId", projectIdParam);
          
          // Force update the form to apply the changes
          setTimeout(() => {
            console.log("DocumentGenerator - Applying projectId again:", projectIdParam);
            form.setValue("projectId", projectIdParam);
          }, 50);
        } else {
          console.log("DocumentGenerator - Project found but not valid for invoice");
        }
        
        if (typeParam) {
          console.log("DocumentGenerator - Setting type to:", typeParam);
          form.setValue("type", typeParam);
        }
        
        // Force form update
        console.log("DocumentGenerator - Values after setting:", form.getValues());
      }
    }
  }, [projectIdParam, typeParam, projects.length, form]);
  
  // Watch for document type changes and update project selection if needed
  useEffect(() => {
    // Get the current form values
    const currentValues = form.getValues();
    const currentType = currentValues.type;
    const currentProjectId = currentValues.projectId;
    
    if (currentProjectId && projects.length > 0) {
      const project = projects.find(p => p.id.toString() === currentProjectId);
      
      // If we have a project and the document type is invoice
      if (project && currentType === "invoice") {
        // Check if the project is valid for invoices
        const isValidForInvoice = project.status === "Delivered" && !project.invoiceSent && !project.isPaid;
        
        // If not valid, clear the project selection
        if (!isValidForInvoice) {
          form.setValue("projectId", "");
          setSelectedProject(null);
        }
      }
    }
  }, [form.watch("type"), projects]);
  
  // Separate effect for auto-generating invoice
  useEffect(() => {
    if (!document && typeParam === "invoice" && projectIdParam && projects.length > 0) {
      const project = projects.find(p => p.id.toString() === projectIdParam);
      
      if (project) {
        // Auto-submit the form
        form.handleSubmit(async (data) => {
          setIsGenerating(true);
          try {
            // First mark the project as invoice sent
            await apiRequest("PATCH", `/api/projects/${projectIdParam}`, {
              invoiceSent: true
            });
            
            // Then generate the invoice
            const generatedDocument = await generateDocument(
              data.type, 
              parseInt(data.projectId)
            );
            
            setDocument(generatedDocument);
            setActiveTab("preview");
            
            // Invalidate projects to refresh data
            queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
            
            toast({
              title: "Invoice generated",
              description: "Your invoice has been generated and the project marked as invoiced.",
            });
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to generate invoice. Please try again later.",
              variant: "destructive",
            });
          } finally {
            setIsGenerating(false);
          }
        })();
      }
    }
  }, [document, projectIdParam, typeParam, projects.length, form, queryClient]);

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id.toString() === projectId);
    return project 
      ? `${project.name} (${getClientName(project.clientId)})`
      : "Unknown Project";
  };

  const onSubmit = async (data: FormValues) => {
    setIsGenerating(true);
    try {
      const generatedDocument = await generateDocument(
        data.type, 
        parseInt(data.projectId)
      );
      
      setDocument(generatedDocument);
      setEditedContent(generatedDocument.content); // Initialize edited content
      setActiveTab("preview");
      
      toast({
        title: `${data.type === "invoice" ? "Invoice" : "Contract"} generated`,
        description: `Your ${data.type} has been generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to generate ${data.type}. Please try again later.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handler for saving edited document content
  const handleSaveEdit = async () => {
    if (!document) return;
    
    setIsSaving(true);
    try {
      // Update the document in the API
      const updatedDocument = await apiRequest(
        "PATCH", 
        `/api/documents/${document.id}`, 
        { content: editedContent }
      );
      
      // Update local state
      setDocument(updatedDocument);
      setIsEditing(false);
      
      toast({
        title: "Document updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (document?.content) {
      copyToClipboard(document.content);
      toast({
        title: "Copied to clipboard",
        description: "Document content has been copied to clipboard.",
      });
    }
  };

  const handleDownloadPdf = () => {
    if (document?.content) {
      const type = document.type.charAt(0).toUpperCase() + document.type.slice(1);
      const projectName = getProjectName(document.projectId?.toString() || "");
      
      exportToPdf(document.content, `${type}-${projectName.replace(/\s+/g, "-")}`);
      
      toast({
        title: "PDF downloaded",
        description: `Your ${document.type} has been downloaded as a PDF.`,
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <div className="mr-4 p-3 bg-green-100 rounded-md">
            <File className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">Document Generator</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate professional invoices and contracts based on your client and project data.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="form">Create Document</TabsTrigger>
            <TabsTrigger value="preview" disabled={!document}>Document Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="invoice">Invoice</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedProject(value);
                        }}
                        value={selectedProject || field.value}
                        defaultValue={selectedProject || field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(() => {
                            // Filter projects based on document type
                            const currentType = form.getValues().type;
                            const filteredProjects = projects.filter(project => {
                              if (currentType === "invoice") {
                                return project.status === "Delivered" && !project.invoiceSent && !project.isPaid;
                              }
                              return true; // For other document types, show all projects
                            });
                            
                            if (filteredProjects.length === 0) {
                              // No eligible projects available
                              return (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  {currentType === "invoice" 
                                    ? "No delivered projects available for invoicing. Projects must be marked as 'Delivered' to create an invoice."
                                    : "No projects available."}
                                </div>
                              );
                            }
                            
                            // Return the list of eligible projects
                            return filteredProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name} ({getClientName(project.clientId)})
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {form.watch("type") === "invoice" && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Only delivered projects that haven't been invoiced yet are available for selection.
                        </p>
                      )}
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isGenerating || projects.length === 0}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generating Document..." : "Generate Document"}
                </Button>
                
                {projects.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    You need to create a project before generating documents.
                  </p>
                )}
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            {document && (
              <div>
                {isEditing ? (
                  <div className="mb-4">
                    <textarea
                      className="w-full h-96 p-6 bg-white border rounded-md font-mono text-sm resize-none"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContent(document.content);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="p-6 bg-white border rounded-md whitespace-pre-wrap font-mono text-sm">
                      {editedContent || document.content}
                    </div>
                    <div className="flex justify-end mt-4 space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Document
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCopyToClipboard}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </Button>
                      <Button onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
