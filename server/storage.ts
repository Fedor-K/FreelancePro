import { 
  clients, type Client, type InsertClient,
  projects, type Project, type InsertProject,
  documents, type Document, type InsertDocument,
  externalData, type ExternalData, type InsertExternalData,
  resumes, type Resume, type InsertResume,
  users, type User, type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Client operations
  getClients(): Promise<Client[]>;
  getClientsByUser(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  getDocumentsByProject(projectId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<{ content: string }>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Resume operations
  getResumes(): Promise<Resume[]>;
  getResumesByUser(userId: number): Promise<Resume[]>;
  getResumesByType(type: string): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;
  
  // External data operations
  getExternalData(): Promise<ExternalData[]>;
  getExternalDataByUser(userId: number): Promise<ExternalData[]>;
  getUnprocessedExternalData(): Promise<ExternalData[]>;
  getExternalDataById(id: number): Promise<ExternalData | undefined>;
  createExternalData(data: InsertExternalData): Promise<ExternalData>;
  markExternalDataAsProcessed(id: number): Promise<boolean>;
  deleteExternalData(id: number): Promise<boolean>;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private documents: Map<number, Document>;
  private externalDataItems: Map<number, ExternalData>;
  private resumeItems: Map<number, Resume>;
  
  private userId: number = 1;
  private clientId: number = 1;
  private projectId: number = 1;
  private documentId: number = 1;
  private externalDataId: number = 1;
  private resumeId: number = 1;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.documents = new Map();
    this.externalDataItems = new Map();
    this.resumeItems = new Map();

    // Initialize with some sample data
    const client1: Client = { 
      id: this.clientId++, 
      name: "Tom Cook", 
      email: "tom@example.com", 
      company: "Acme Corporation", 
      language: "English, German",
      userId: null
    };
    
    const client2: Client = { 
      id: this.clientId++, 
      name: "Sarah Johnson", 
      email: "sarah@techstyle.com", 
      company: "TechStyle Inc.", 
      language: "English, Spanish",
      userId: null
    };
    
    const client3: Client = { 
      id: this.clientId++, 
      name: "Michael Rodriguez", 
      email: "michael@greenleaf.com", 
      company: "GreenLeaf Agency", 
      language: "French, Italian",
      userId: null
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
      userId: null
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
      isPaid: false
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
      isPaid: false
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
      isPaid: true
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
      isPaid: false
    };

    this.projects.set(project1.id, project1);
    this.projects.set(project2.id, project2);
    this.projects.set(project3.id, project3);
    this.projects.set(project4.id, project4);
    this.projects.set(project5.id, project5);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    // First get all data related to this user
    const userClients = await this.getClientsByUser(id);
    const userProjects = await this.getProjectsByUser(id);
    const userDocuments = await this.getDocumentsByUser(id);
    const userResumes = await this.getResumesByUser(id);
    const userExternalData = await this.getExternalDataByUser(id);
    
    // Delete all related data
    
    // Delete documents
    for (const doc of userDocuments) {
      await this.deleteDocument(doc.id);
    }
    
    // Delete resumes
    for (const resume of userResumes) {
      await this.deleteResume(resume.id);
    }
    
    // Delete external data
    for (const data of userExternalData) {
      await this.deleteExternalData(data.id);
    }
    
    // Delete projects
    for (const project of userProjects) {
      await this.deleteProject(project.id);
    }
    
    // Delete clients
    for (const client of userClients) {
      await this.deleteClient(client.id);
    }
    
    // Finally delete the user
    return this.users.delete(id);
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClientsByUser(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
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

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
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



  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId
    );
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
  
  async getExternalDataByUser(userId: number): Promise<ExternalData[]> {
    return Array.from(this.externalDataItems.values()).filter(
      (item) => item.userId === userId
    );
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

  // Resume operations
  async getResumes(): Promise<Resume[]> {
    return Array.from(this.resumeItems.values());
  }
  
  async getResumesByUser(userId: number): Promise<Resume[]> {
    return Array.from(this.resumeItems.values()).filter(
      (resume) => resume.userId === userId
    );
  }

  async getResumesByType(type: string): Promise<Resume[]> {
    return Array.from(this.resumeItems.values()).filter(resume => resume.type === type);
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumeItems.get(id);
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const id = this.resumeId++;
    const newResume: Resume = {
      ...resume,
      id,
      createdAt: new Date()
    };
    this.resumeItems.set(id, newResume);
    return newResume;
  }

  async updateResume(id: number, resumeData: Partial<InsertResume>): Promise<Resume | undefined> {
    const resume = this.resumeItems.get(id);
    if (!resume) {
      return undefined;
    }
    
    const updatedResume = { ...resume, ...resumeData };
    this.resumeItems.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumeItems.delete(id);
  }
}

// Export instance
// Database-based storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Error fetching user by ID ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error(`Error fetching user by username ${username}:`, error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(userData).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    try {
      return await db.select().from(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
  }

  async getClientsByUser(userId: number): Promise<Client[]> {
    try {
      return await db.select().from(clients).where(eq(clients.userId, userId));
    } catch (error) {
      console.error(`Error fetching clients for user ${userId}:`, error);
      return [];
    }
  }

  async getClient(id: number): Promise<Client | undefined> {
    try {
      const [client] = await db.select().from(clients).where(eq(clients.id, id));
      return client;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      return undefined;
    }
  }

  async createClient(clientData: InsertClient): Promise<Client> {
    try {
      const [client] = await db.insert(clients).values(clientData).returning();
      return client;
    } catch (error) {
      console.error("Error creating client:", error);
      throw new Error("Failed to create client");
    }
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    try {
      const [updatedClient] = await db
        .update(clients)
        .set(clientData)
        .where(eq(clients.id, id))
        .returning();
      return updatedClient;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      return undefined;
    }
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      await db.delete(clients).where(eq(clients.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting client ${id}:`, error);
      return false;
    }
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    try {
      return await db.select().from(projects).where(eq(projects.userId, userId));
    } catch (error) {
      console.error(`Error fetching projects for user ${userId}:`, error);
      return [];
    }
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    try {
      return await db.select().from(projects).where(eq(projects.clientId, clientId));
    } catch (error) {
      console.error(`Error fetching projects for client ${clientId}:`, error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return undefined;
    }
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    try {
      const [project] = await db.insert(projects).values(projectData).returning();
      return project;
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Failed to create project");
    }
  }

  async updateProject(id: number, projectData: Partial<InsertProject>): Promise<Project | undefined> {
    try {
      const [updatedProject] = await db
        .update(projects)
        .set(projectData)
        .where(eq(projects.id, id))
        .returning();
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      return undefined;
    }
  }

  async deleteProject(id: number): Promise<boolean> {
    try {
      await db.delete(projects).where(eq(projects.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    try {
      return await db.select().from(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  }

  async getDocumentsByUser(userId: number): Promise<Document[]> {
    try {
      return await db.select().from(documents).where(eq(documents.userId, userId));
    } catch (error) {
      console.error(`Error fetching documents for user ${userId}:`, error);
      return [];
    }
  }

  async getDocumentsByProject(projectId: number): Promise<Document[]> {
    try {
      return await db.select().from(documents).where(eq(documents.projectId, projectId));
    } catch (error) {
      console.error(`Error fetching documents for project ${projectId}:`, error);
      return [];
    }
  }

  async getDocument(id: number): Promise<Document | undefined> {
    try {
      const [document] = await db.select().from(documents).where(eq(documents.id, id));
      return document;
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      return undefined;
    }
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    try {
      const [document] = await db.insert(documents).values(documentData).returning();
      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Failed to create document");
    }
  }

  async updateDocument(id: number, documentData: Partial<{ content: string }>): Promise<Document | undefined> {
    try {
      const [updatedDocument] = await db
        .update(documents)
        .set(documentData)
        .where(eq(documents.id, id))
        .returning();
      return updatedDocument;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      return undefined;
    }
  }

  async deleteDocument(id: number): Promise<boolean> {
    try {
      await db.delete(documents).where(eq(documents.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      return false;
    }
  }

  // External data operations
  async getExternalData(): Promise<ExternalData[]> {
    try {
      return await db.select().from(externalData);
    } catch (error) {
      console.error("Error fetching external data:", error);
      return [];
    }
  }

  async getExternalDataByUser(userId: number): Promise<ExternalData[]> {
    try {
      return await db.select().from(externalData).where(eq(externalData.userId, userId));
    } catch (error) {
      console.error(`Error fetching external data for user ${userId}:`, error);
      return [];
    }
  }

  async getUnprocessedExternalData(): Promise<ExternalData[]> {
    try {
      return await db.select().from(externalData).where(eq(externalData.processed, false));
    } catch (error) {
      console.error("Error fetching unprocessed external data:", error);
      return [];
    }
  }

  async getExternalDataById(id: number): Promise<ExternalData | undefined> {
    try {
      const [data] = await db.select().from(externalData).where(eq(externalData.id, id));
      return data;
    } catch (error) {
      console.error(`Error fetching external data ${id}:`, error);
      return undefined;
    }
  }

  async createExternalData(data: InsertExternalData): Promise<ExternalData> {
    try {
      const [externalDataItem] = await db.insert(externalData).values(data).returning();
      return externalDataItem;
    } catch (error) {
      console.error("Error creating external data:", error);
      throw new Error("Failed to create external data");
    }
  }

  async markExternalDataAsProcessed(id: number): Promise<boolean> {
    try {
      await db
        .update(externalData)
        .set({ processed: true })
        .where(eq(externalData.id, id));
      return true;
    } catch (error) {
      console.error(`Error marking external data ${id} as processed:`, error);
      return false;
    }
  }

  async deleteExternalData(id: number): Promise<boolean> {
    try {
      await db.delete(externalData).where(eq(externalData.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting external data ${id}:`, error);
      return false;
    }
  }

  // Resume operations
  async getResumes(): Promise<Resume[]> {
    try {
      return await db.select().from(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      return [];
    }
  }

  async getResumesByUser(userId: number): Promise<Resume[]> {
    try {
      return await db.select().from(resumes).where(eq(resumes.userId, userId));
    } catch (error) {
      console.error(`Error fetching resumes for user ${userId}:`, error);
      return [];
    }
  }

  async getResumesByType(type: string): Promise<Resume[]> {
    try {
      return await db.select().from(resumes).where(eq(resumes.type, type));
    } catch (error) {
      console.error(`Error fetching resumes of type ${type}:`, error);
      return [];
    }
  }

  async getResume(id: number): Promise<Resume | undefined> {
    try {
      const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
      return resume;
    } catch (error) {
      console.error(`Error fetching resume ${id}:`, error);
      return undefined;
    }
  }

  async createResume(resumeData: InsertResume): Promise<Resume> {
    try {
      const [resume] = await db.insert(resumes).values(resumeData).returning();
      return resume;
    } catch (error) {
      console.error("Error creating resume:", error);
      throw new Error("Failed to create resume");
    }
  }

  async updateResume(id: number, resumeData: Partial<InsertResume>): Promise<Resume | undefined> {
    try {
      const [updatedResume] = await db
        .update(resumes)
        .set(resumeData)
        .where(eq(resumes.id, id))
        .returning();
      return updatedResume;
    } catch (error) {
      console.error(`Error updating resume ${id}:`, error);
      return undefined;
    }
  }

  async deleteResume(id: number): Promise<boolean> {
    try {
      await db.delete(resumes).where(eq(resumes.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting resume ${id}:`, error);
      return false;
    }
  }
}

// Always use database storage in production, but can be overridden
export const storage = process.env.USE_MEM_STORAGE === 'true'
  ? new MemStorage()
  : new DatabaseStorage();
