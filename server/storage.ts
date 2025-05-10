import { 
  clients, type Client, type InsertClient,
  projects, type Project, type InsertProject,
  resumes, type Resume, type InsertResume,
  documents, type Document, type InsertDocument,
  externalData, type ExternalData, type InsertExternalData
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Resume operations
  getResumes(): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume & { content: string }): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume & { content: string }>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;

  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentsByProject(projectId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<{ content: string }>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // External data operations
  getExternalData(): Promise<ExternalData[]>;
  getUnprocessedExternalData(): Promise<ExternalData[]>;
  getExternalDataById(id: number): Promise<ExternalData | undefined>;
  createExternalData(data: InsertExternalData): Promise<ExternalData>;
  markExternalDataAsProcessed(id: number): Promise<boolean>;
  deleteExternalData(id: number): Promise<boolean>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private resumes: Map<number, Resume>;
  private documents: Map<number, Document>;
  private externalDataItems: Map<number, ExternalData>;
  
  private clientId: number = 1;
  private projectId: number = 1;
  private resumeId: number = 1;
  private documentId: number = 1;
  private externalDataId: number = 1;

  constructor() {
    this.clients = new Map();
    this.projects = new Map();
    this.resumes = new Map();
    this.documents = new Map();
    this.externalDataItems = new Map();

    // Initialize with some sample data
    const client1: Client = { 
      id: this.clientId++, 
      name: "Tom Cook", 
      email: "tom@example.com", 
      company: "Acme Corporation", 
      language: "English, German" 
    };
    
    const client2: Client = { 
      id: this.clientId++, 
      name: "Sarah Johnson", 
      email: "sarah@techstyle.com", 
      company: "TechStyle Inc.", 
      language: "English, Spanish" 
    };
    
    const client3: Client = { 
      id: this.clientId++, 
      name: "Michael Rodriguez", 
      email: "michael@greenleaf.com", 
      company: "GreenLeaf Agency", 
      language: "French, Italian" 
    };

    this.clients.set(client1.id, client1);
    this.clients.set(client2.id, client2);
    this.clients.set(client3.id, client3);

    // Sample projects with language pairs and realistic deadlines
    const project1: Project = {
      id: this.projectId++,
      clientId: client1.id,
      name: "Website Translation - German",
      description: "Translate website content to German",
      deadline: new Date(2025, 4, 25), // Future date
      amount: 950,
      volume: 15000,
      sourceLang: "English",
      targetLang: "German",
      status: "In Progress",
      labels: ["In Progress"],
      invoiceSent: false,
      isPaid: false,
      isArchived: false
    };

    const project2: Project = {
      id: this.projectId++,
      clientId: client2.id,
      name: "Product Description Editing",
      description: "Edit product descriptions for clarity and SEO",
      deadline: new Date(2025, 5, 10), // Future date
      amount: 480,
      volume: 8000,
      sourceLang: "English",
      targetLang: "Spanish",
      status: "In Progress",
      labels: ["In Progress"],
      invoiceSent: false,
      isPaid: false,
      isArchived: false
    };

    const project3: Project = {
      id: this.projectId++,
      clientId: client3.id,
      name: "Marketing Copywriting",
      description: "Create marketing copy for new campaign",
      deadline: new Date(2025, 4, 18), // Future date
      amount: 750,
      volume: 5000,
      sourceLang: "French",
      targetLang: "English",
      status: "Delivered",
      labels: ["Delivered", "Pending payment"],
      invoiceSent: true,
      isPaid: false,
      isArchived: false
    };

    const project4: Project = {
      id: this.projectId++,
      clientId: client2.id,
      name: "Blog Post Series",
      description: "Create a series of blog posts about travel",
      deadline: new Date(2025, 4, 15), // Future date
      amount: 1200,
      volume: 20000,
      sourceLang: "Spanish",
      targetLang: "English",
      status: "Paid",
      labels: ["Paid"],
      invoiceSent: true,
      isPaid: true,
      isArchived: false
    };
    
    // Project with an overdue deadline
    const project5: Project = {
      id: this.projectId++,
      clientId: client1.id,
      name: "Technical Manual Translation",
      description: "Translate technical manual for industrial equipment",
      deadline: new Date(2025, 3, 10), // Past date relative to May
      amount: 2500,
      volume: 45000,
      sourceLang: "English",
      targetLang: "German",
      status: "In Progress",
      labels: ["In Progress", "Overdue"],
      invoiceSent: false,
      isPaid: false,
      isArchived: false
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);
    this.projects.set(project4.id, project4);
    this.projects.set(project5.id, project5);
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const newClient = { ...client, id };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) {
      return undefined;
    }
    
    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Resume methods
  async getResumes(): Promise<Resume[]> {
    return Array.from(this.resumes.values());
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createResume(resume: InsertResume & { content: string }): Promise<Resume> {
    const id = this.resumeId++;
    const newResume = { ...resume, id };
    this.resumes.set(id, newResume);
    return newResume;
  }

  async updateResume(id: number, resume: Partial<InsertResume & { content: string }>): Promise<Resume | undefined> {
    const existingResume = this.resumes.get(id);
    if (!existingResume) {
      return undefined;
    }
    
    const updatedResume = { ...existingResume, ...resume };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByProject(projectId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.projectId === projectId
    );
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentId++;
    const newDocument = { 
      ...document, 
      id, 
      createdAt: new Date() 
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<{ content: string }>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) {
      return undefined;
    }
    
    // Update the document content if provided
    if (document.content !== undefined) {
      existingDocument.content = document.content;
    }
    
    // Save the updated document
    this.documents.set(id, existingDocument);
    return existingDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // External data methods
  async getExternalData(): Promise<ExternalData[]> {
    return Array.from(this.externalDataItems.values());
  }

  async getUnprocessedExternalData(): Promise<ExternalData[]> {
    return Array.from(this.externalDataItems.values()).filter(
      (item) => !item.processed
    );
  }

  async getExternalDataById(id: number): Promise<ExternalData | undefined> {
    return this.externalDataItems.get(id);
  }

  async createExternalData(data: InsertExternalData): Promise<ExternalData> {
    const id = this.externalDataId++;
    const newExternalData: ExternalData = {
      ...data,
      id,
      processed: false,
      createdAt: new Date()
    };
    this.externalDataItems.set(id, newExternalData);
    return newExternalData;
  }

  async markExternalDataAsProcessed(id: number): Promise<boolean> {
    const externalData = this.externalDataItems.get(id);
    if (!externalData) {
      return false;
    }
    
    const updatedData = { ...externalData, processed: true };
    this.externalDataItems.set(id, updatedData);
    return true;
  }

  async deleteExternalData(id: number): Promise<boolean> {
    return this.externalDataItems.delete(id);
  }
}

// Export instance
export const storage = new MemStorage();
