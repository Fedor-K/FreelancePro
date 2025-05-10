import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentGenerator } from "@/components/documents/DocumentGenerator";
import { useQuery } from "@tanstack/react-query";
import { Document as DocumentType, Client, Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { File, Download, Copy, Trash2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { exportToPdf, copyToClipboard } from "@/lib/docGenerator";
import { useLocation } from "wouter";

export default function Documents() {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentType | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [documentType, setDocumentType] = useState<"invoice" | "contract">("invoice");
  const [location] = useLocation();
  
  // Check for URL parameters to determine if we should show the create tab
  useEffect(() => {
    console.log("Documents page - Processing URL:", location);
    const searchParams = new URLSearchParams(location.split("?")[1] || "");
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type");
    
    console.log("Documents page - URL params:", { projectId, type });
    
    if (projectId && type) {
      // If project ID and document type are provided, switch to create tab
      console.log("Documents page - Switching to create tab");
      setActiveTab("create");
    }
  }, [location]);
  
  const { data: documents = [], isLoading: isLoadingDocuments, refetch } = useQuery<DocumentType[]>({
    queryKey: ['/api/documents'],
  });
  
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });
  
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });
  
  const isLoading = isLoadingDocuments || isLoadingProjects || isLoadingClients;

  const getProjectName = (projectId?: number | null) => {
    if (!projectId) return "N/A";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const getClientName = (projectId?: number | null) => {
    if (!projectId) return "N/A";
    const project = projects.find(p => p.id === projectId);
    if (!project) return "Unknown Client";
    
    const client = clients.find(c => c.id === project.clientId);
    return client?.name || "Unknown Client";
  };

  const handleCopyToClipboard = (content: string) => {
    copyToClipboard(content);
    toast({
      title: "Copied to clipboard",
      description: "Document content has been copied to clipboard.",
    });
  };

  const handleDownloadPdf = (document: DocumentType) => {
    const type = document.type.charAt(0).toUpperCase() + document.type.slice(1);
    const projectName = getProjectName(document.projectId as number);
    
    exportToPdf(document.content, `${type}-${projectName.replace(/\s+/g, "-")}`);
    
    toast({
      title: "PDF downloaded",
      description: `Your ${document.type} has been downloaded as a PDF.`,
    });
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/documents/${documentToDelete.id}`, undefined);
      
      await refetch();
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getDocumentIcon = (type: string) => {
    return type === "invoice" ? <File className="h-6 w-6 text-secondary" /> : <FileText className="h-6 w-6 text-primary" />;
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Generator</CardTitle>
          <CardDescription>
            Generate professional invoices and contracts based on your client and project data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Document generator content will be shown in the tabs below */}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="create">Create Document</TabsTrigger>
          <TabsTrigger value="saved">Saved Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <DocumentGenerator />
        </TabsContent>
        
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Documents</CardTitle>
              <CardDescription>
                View, download, or manage your previously generated documents.
              </CardDescription>
              
              <div className="mt-4">
                <Tabs value={documentType} onValueChange={(value) => setDocumentType(value as "invoice" | "contract")}>
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="invoice">
                      Invoices
                      <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium">
                        {documents.filter(doc => doc.type === "invoice").length}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="contract">
                      Contracts
                      <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-medium">
                        {documents.filter(doc => doc.type === "contract").length}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-gray-500">Loading documents...</p>
              ) : documents.length === 0 || !documents.some(doc => doc.type === documentType) ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  {documents.length === 0 ? (
                    <>
                      <p className="text-lg font-medium">No documents yet</p>
                      <p className="mt-1">Create your first document to get started.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No {documentType}s found</p>
                      <p className="mt-1">
                        {documentType === "invoice" 
                          ? "Create an invoice for a delivered project to get started." 
                          : "Create a contract to get started."}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {documents
                    .filter(document => document.type === documentType)
                    .map((document) => (
                    <div key={document.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          {getDocumentIcon(document.type)}
                          <div className="ml-3">
                            <h3 className="font-medium text-lg capitalize">{document.type}</h3>
                            <p className="text-sm text-gray-500">
                              Project: {getProjectName(document.projectId as number)}
                              <span className="mx-1">•</span>
                              Client: {getClientName(document.projectId as number)}
                            </p>
                            {document.createdAt && (
                              <p className="text-xs text-gray-500">
                                Created: {new Date(document.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCopyToClipboard(document.content)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPdf(document)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDocumentToDelete(document);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm max-h-48 overflow-y-auto">
                        {document.content.length > 300 
                          ? `${document.content.substring(0, 300)}...`
                          : document.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-3 rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-center">Delete Document</h2>
                <p className="text-center text-gray-500">
                  Are you sure you want to delete this {documentToDelete?.type}? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end w-full space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setDocumentToDelete(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteDocument}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
