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
import { Project, Document as DocumentType } from "@shared/schema";
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
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [activeTab, setActiveTab] = useState("form");
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch projects for the select dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  // Fetch clients to display project client names
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  // Parse query parameters
  const searchParams = new URLSearchParams(location.split("?")[1]);
  const projectIdParam = searchParams.get("projectId");
  const typeParam = searchParams.get("type") as "invoice" | "contract" | null;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: typeParam || "invoice",
      projectId: projectIdParam || "",
    },
  });
  
  // Effect to handle invoice creation from other pages
  useEffect(() => {
    // If projectId and type are specified, auto-generate the document
    if (projectIdParam && typeParam && projects.length > 0) {
      // Auto-select the form values
      form.setValue("projectId", projectIdParam);
      form.setValue("type", typeParam);
      
      // Only auto-generate if the document hasn't been generated yet
      if (!document && typeParam === "invoice") {
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
  }, [projectIdParam, typeParam, projects.length, document]);

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
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
                        defaultValue={field.value}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name} ({getClientName(project.clientId)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                <div className="p-6 bg-white border rounded-md whitespace-pre-wrap font-mono text-sm">
                  {document.content}
                </div>
                <div className="flex justify-end mt-4 space-x-3">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
