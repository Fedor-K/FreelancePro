import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertProjectSchema,
  insertDocumentSchema,
  insertExternalDataSchema,
  insertResumeSchema,
  webhookPayloadSchema
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { isValidApiKey, getApiKeySource } from "./config";
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './vite';
import { setupAuth } from "./auth";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key" });

// Middleware to verify API key
const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      message: "API key is required", 
      error: "Unauthorized", 
      details: "Please provide your API key in the X-API-Key header" 
    });
  }
  
  if (!isValidApiKey(apiKey)) {
    return res.status(403).json({ 
      message: "Invalid API key", 
      error: "Forbidden", 
      details: "The provided API key is not valid or has been revoked" 
    });
  }
  
  // Add source to request for logging/tracking
  (req as any).apiKeySource = getApiKeySource(apiKey);
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked. Please contact an administrator." });
    }
    
    next();
  };
  
  // Middleware to check admin rights
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin rights required" });
    }
    
    next();
  };
  
  // Client routes
  app.get("/api/clients", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const clients = await storage.getClientsByUser(userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Verify user ownership
      const userId = req.user?.id;
      if (!userId || (client.userId !== null && client.userId !== userId)) {
        return res.status(403).json({ message: "You do not have access to this client" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", requireAuth, async (req: Request, res: Response) => {
    try {
      const result = insertClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid client data", errors: result.error.format() });
      }
      
      // Add the authenticated user's ID to the client data
      const clientData = {
        ...result.data,
        userId: req.user?.id || null
      };
      
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const result = insertClientSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid client data", errors: result.error.format() });
      }
      
      const updatedClient = await storage.updateClient(id, result.data);
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Project routes
  app.get("/api/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      let projects;
      if (req.query.clientId) {
        const clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
        // First verify the client belongs to the user
        const client = await storage.getClient(clientId);
        if (!client || (client.userId !== null && client.userId !== userId)) {
          return res.status(403).json({ message: "You do not have access to this client" });
        }
        projects = await storage.getProjectsByClient(clientId);
      } else {
        projects = await storage.getProjectsByUser(userId);
      }
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Verify user ownership
      const userId = req.user?.id;
      if (!userId || (project.userId !== null && project.userId !== userId)) {
        return res.status(403).json({ message: "You do not have access to this project" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Process the request data
      const data = { ...req.body, userId };
      
      // Parse deadline if it's a string
      if (typeof data.deadline === 'string' && data.deadline) {
        try {
          data.deadline = new Date(data.deadline);
        } catch (e) {
          return res.status(400).json({ 
            message: "Invalid project data", 
            errors: { deadline: { _errors: ["Invalid date format"] } }
          });
        }
      }
      
      const result = insertProjectSchema.safeParse(data);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid project data", errors: result.error.format() });
      }
      
      // Verify client exists and belongs to user
      const client = await storage.getClient(result.data.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
      }
      
      // Verify client belongs to the user
      if (client.userId !== null && client.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this client" });
      }
      
      // Business logic validation
      // Ensure invoice can't be sent for In Progress projects
      if (result.data.status === "In Progress" && result.data.invoiceSent === true) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: { invoiceSent: { _errors: ["Cannot mark invoice as sent for projects that are in progress"] } }
        });
      }
      
      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      console.log("PATCH request received for project with ID:", req.params.id);
      console.log("Request body:", req.body);
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.log("Invalid project ID:", req.params.id);
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        console.log("Project not found with ID:", id);
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Verify user ownership
      if (project.userId !== null && project.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this project" });
      }
      
      console.log("Original project data:", project);
      
      // Process the request data
      const data = { ...req.body };
      
      // Parse deadline if it's a string
      if (typeof data.deadline === 'string' && data.deadline) {
        try {
          data.deadline = new Date(data.deadline);
        } catch (e) {
          console.log("Invalid date format:", data.deadline, e);
          return res.status(400).json({ 
            message: "Invalid project data", 
            errors: { deadline: { _errors: ["Invalid date format"] } }
          });
        }
      }
      
      const result = insertProjectSchema.partial().safeParse(data);
      if (!result.success) {
        console.log("Validation failed:", result.error.format());
        return res.status(400).json({ message: "Invalid project data", errors: result.error.format() });
      }
      
      console.log("Data after validation:", result.data);
      
      // Business logic validation
      // If changing status to "In Progress", ensure invoiceSent is false
      if (result.data.status === "In Progress" && project.invoiceSent) {
        result.data.invoiceSent = false;
        console.log("Reset invoiceSent to false for In Progress project");
      }
      
      // If setting invoiceSent to true, ensure the project isn't in "In Progress" status
      if (result.data.invoiceSent === true && 
          (project.status === "In Progress" || result.data.status === "In Progress")) {
        return res.status(400).json({ 
          message: "Invalid project update", 
          errors: { invoiceSent: { _errors: ["Cannot mark invoice as sent for projects that are in progress"] } }
        });
      }
      
      const updatedProject = await storage.updateProject(id, result.data);
      console.log("Updated project:", updatedProject);
      res.json(updatedProject);
    } catch (error) {
      console.error("Project update error:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if the project exists and belongs to the user
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Verify user ownership
      if (project.userId !== null && project.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this project" });
      }
      
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Document routes
  app.get("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      let documents;
      if (req.query.projectId) {
        const projectId = parseInt(req.query.projectId as string);
        if (isNaN(projectId)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }
        
        // Verify that the project belongs to the user
        const project = await storage.getProject(projectId);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        
        if (project.userId !== null && project.userId !== userId) {
          return res.status(403).json({ message: "You do not have access to this project" });
        }
        
        documents = await storage.getDocumentsByProject(projectId);
      } else {
        documents = await storage.getDocumentsByUser(userId);
      }
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify user ownership
      if (document.userId !== null && document.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this document" });
      }
      
      // If document has a projectId, verify project ownership as well
      if (document.projectId) {
        const project = await storage.getProject(document.projectId);
        if (project && project.userId !== null && project.userId !== userId) {
          return res.status(403).json({ message: "You do not have access to this document" });
        }
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  app.patch("/api/documents/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify user ownership of document
      if (document.userId !== null && document.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this document" });
      }
      
      // If document has a projectId, verify project ownership as well
      if (document.projectId) {
        const project = await storage.getProject(document.projectId);
        if (project && project.userId !== null && project.userId !== userId) {
          return res.status(403).json({ message: "You do not have access to this document's project" });
        }
      }
      
      // Only allow updating content for now
      const updateData = { 
        content: req.body.content
      };
      
      // Update the document content
      const updatedDocument = {
        ...document,
        content: updateData.content
      };
      
      // Store the updated document
      const result = await storage.updateDocument(id, updateData);
      if (!result) {
        return res.status(500).json({ message: "Failed to update document" });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const result = insertDocumentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid document data", errors: result.error.format() });
      }
      
      // If project ID is provided, verify it exists
      if (result.data.projectId) {
        const project = await storage.getProject(result.data.projectId);
        if (!project) {
          return res.status(400).json({ message: "Project not found" });
        }
      }
      
      const document = await storage.createDocument(result.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Generate document from template (invoice or contract)
  app.post("/api/documents/generate", async (req: Request, res: Response) => {
    try {
      const { type, projectId } = req.body;
      
      if (!type || (type !== 'invoice' && type !== 'contract')) {
        return res.status(400).json({ message: "Invalid document type. Must be 'invoice' or 'contract'" });
      }
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Business logic validation - can't create invoice for In Progress projects
      if (type === 'invoice' && project.status === "In Progress") {
        return res.status(400).json({ 
          message: "Cannot create invoice", 
          errors: { status: { _errors: ["Cannot create invoice for projects that are still in progress"] } }
        });
      }
      
      const client = await storage.getClient(project.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      let documentContent = '';
      
      if (type === 'invoice') {
        documentContent = `
INVOICE

From: Freelancer
To: ${client.name}
Company: ${client.company || 'N/A'}
Email: ${client.email}

Project: ${project.name}
Description: ${project.description || 'N/A'}
Amount: $${project.amount?.toFixed(2) || '0.00'}
Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
Status: ${project.status}

Payment Terms: Due upon receipt
`;
      } else {
        documentContent = `
CONTRACT

Between: Freelancer
And: ${client.name} (${client.company || 'Individual'})

Project Details:
Name: ${project.name}
Description: ${project.description || 'N/A'}
Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
Amount: $${project.amount?.toFixed(2) || '0.00'}

Terms and Conditions:
1. The freelancer agrees to complete the project as described above.
2. Payment will be made upon completion of the project.
3. Any revisions beyond the scope of the project will be billed separately.
4. The client retains all rights to the final deliverables upon full payment.

Client Signature: ____________________
Date: ____________
`;
      }
      
      const document = await storage.createDocument({
        type,
        projectId: project.id,
        content: documentContent
      });
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate document" });
    }
  });

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const success = await storage.deleteDocument(id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Stats for dashboard
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      const projects = await storage.getProjects();
      const documents = await storage.getDocuments();
      
      // Calculate stats
      const activeClients = clients.length;
      const ongoingProjects = projects.filter(p => p.status === "In Progress").length;
      
      // Calculate monthly revenue (sum of all projects marked as "Paid")
      const completedProjects = projects.filter(p => p.status === "Paid");
      const monthlyRevenue = completedProjects.reduce((sum, project) => sum + (project.amount || 0), 0);
      
      const documentsGenerated = documents.length;
      
      res.json({
        activeClients,
        ongoingProjects,
        monthlyRevenue,
        documentsGenerated
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // External data webhook endpoints
  app.post("/api/webhook/data", verifyApiKey, async (req: Request, res: Response) => {
    try {
      const result = webhookPayloadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid webhook payload", 
          errors: result.error.format() 
        });
      }
      
      // Save the data
      const externalData = await storage.createExternalData({
        source: (req as any).apiKeySource || "unknown",
        dataType: result.data.type,
        content: JSON.stringify(result.data)
        // Note: processed flag is now handled internally by the storage method
      });
      
      res.status(201).json({
        message: "Data received successfully",
        dataId: externalData.id
      });
    } catch (error) {
      console.error("Error processing webhook data:", error);
      res.status(500).json({ message: "Failed to process external data" });
    }
  });

  // GET external data (admin access)
  app.get("/api/external-data", async (req: Request, res: Response) => {
    try {
      const data = await storage.getExternalData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch external data" });
    }
  });

  // GET unprocessed external data (admin access)
  app.get("/api/external-data/unprocessed", async (req: Request, res: Response) => {
    try {
      const data = await storage.getUnprocessedExternalData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unprocessed external data" });
    }
  });

  // GET single external data item (admin access)
  app.get("/api/external-data/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid external data ID" });
      }
      
      const data = await storage.getExternalDataById(id);
      if (!data) {
        return res.status(404).json({ message: "External data not found" });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch external data" });
    }
  });

  // Mark external data as processed (admin access)
  app.patch("/api/external-data/:id/process", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid external data ID" });
      }
      
      const success = await storage.markExternalDataAsProcessed(id);
      if (!success) {
        return res.status(404).json({ message: "External data not found" });
      }
      
      res.json({ message: "External data marked as processed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to process external data" });
    }
  });

  // DELETE external data (admin access)
  app.delete("/api/external-data/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid external data ID" });
      }
      
      const success = await storage.deleteExternalData(id);
      if (!success) {
        return res.status(404).json({ message: "External data not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete external data" });
    }
  });
  
  // Admin routes for user management
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  app.patch("/api/admin/users/:id/block", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Cannot block yourself
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot block your own account" });
      }
      
      const isBlocked = req.body.isBlocked === true;
      const updatedUser = await storage.updateUser(id, { isBlocked });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  app.delete("/api/admin/users/:id", requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Cannot delete yourself
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Admin route for summary statistics
  app.get("/api/admin/summary", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const clients = await storage.getClients();
      const projects = await storage.getProjects();
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalClients = clients.length;
      const totalProjects = projects.length;
      const projectsInProgress = projects.filter(p => p.status === "In Progress").length;
      const projectsDelivered = projects.filter(p => p.status === "Delivered").length;
      const projectsPaid = projects.filter(p => p.status === "Paid").length;
      
      // Calculate total earnings
      const totalEarnings = projects
        .filter(p => p.amount !== null)
        .reduce((sum, project) => sum + (project.amount || 0), 0);
      
      // Get user with most projects
      const userProjectCounts = projects.reduce((counts, project) => {
        if (project.userId) {
          counts[project.userId] = (counts[project.userId] || 0) + 1;
        }
        return counts;
      }, {} as Record<number, number>);
      
      const mostActiveUserId = Object.entries(userProjectCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]))[0] || null;
      
      const mostActiveUser = mostActiveUserId 
        ? users.find(u => u.id === mostActiveUserId) 
        : null;
      
      const summary = {
        totalUsers,
        totalClients,
        totalProjects,
        projectsInProgress,
        projectsDelivered,
        projectsPaid,
        totalEarnings,
        mostActiveUser: mostActiveUser ? {
          id: mostActiveUser.id,
          username: mostActiveUser.username,
          email: mostActiveUser.email,
          fullName: mostActiveUser.fullName,
          projectCount: userProjectCounts[mostActiveUserId]
        } : null
      };
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary data" });
    }
  });

  // Resume routes
  app.get("/api/resumes", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      let resumes;
      // Filter by type if provided
      if (req.query.type) {
        const type = req.query.type as string;
        // Get resumes by type AND user
        const allTypeResumes = await storage.getResumesByType(type);
        resumes = allTypeResumes.filter(resume => resume.userId === userId);
      } else {
        // Get only user's resumes
        resumes = await storage.getResumesByUser(userId);
      }
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const resume = await storage.getResume(id);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if this resume belongs to the authenticated user
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this resume" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post("/api/resumes", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Add userId to the request data
      const data = { ...req.body, userId };
      
      const result = insertResumeSchema.safeParse(data);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid resume data", 
          errors: result.error.format() 
        });
      }
      
      const resume = await storage.createResume(result.data);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Resume creation error:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.patch("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const updateData = req.body;
      
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if this resume belongs to the authenticated user
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this resume" });
      }
      
      const updatedResume = await storage.updateResume(id, updateData);
      if (!updatedResume) {
        return res.status(500).json({ message: "Failed to update resume" });
      }
      
      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // First check if resume exists and belongs to user
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if this resume belongs to the authenticated user
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "You do not have access to this resume" });
      }
      
      const success = await storage.deleteResume(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete resume" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // AI-powered cover letter generation
  app.post("/api/ai/generate-cover-letter", async (req: Request, res: Response) => {
    try {
      // Import here to avoid circular dependencies
      const { generateCoverLetter } = await import("./openai");
      
      const { 
        name, 
        jobTitle, 
        targetPosition, 
        targetCompany, 
        selectedProjects,
        jobDescription,
        skills
      } = req.body;
      
      if (!targetPosition || !targetCompany) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          details: "Target position and company are required" 
        });
      }
      
      const coverLetter = await generateCoverLetter({
        name: name || "",
        jobTitle: jobTitle || "",
        targetPosition,
        targetCompany,
        selectedProjects: selectedProjects || [],
        jobDescription: jobDescription || "",
        skills: skills || []
      });
      
      res.json({ coverLetter });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ 
        message: "Failed to generate cover letter", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Define types for WebSocket connections
  type ConnectionData = {
    ws: WebSocket;
    projectId: string | null;
  };

  // Store active connections and their project rooms
  const connections = new Map<string, ConnectionData>();
  const projectRooms = new Map<string, Set<string>>();

  wss.on('connection', (ws) => {
    log('WebSocket connection established', 'websocket');
    
    // Generate a unique ID for this connection
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    connections.set(connectionId, { ws, projectId: null });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`Received message: ${JSON.stringify(data)}`, 'websocket');

        // Handle different message types
        if (data.type === 'join') {
          // Join a project room
          const projectId = data.projectId;
          
          // Add to project room
          if (!projectRooms.has(projectId)) {
            projectRooms.set(projectId, new Set());
          }
          
          const roomSet = projectRooms.get(projectId);
          if (roomSet) {
            roomSet.add(connectionId);
          }
          
          // Update connection data
          const conn = connections.get(connectionId);
          if (conn) {
            conn.projectId = projectId;
          }
          
          log(`Client ${connectionId} joined project ${projectId}`, 'websocket');
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'joined',
            projectId,
            status: 'success'
          }));
        } else if (data.type === 'node_update' || data.type === 'edge_update' || 
                   data.type === 'node_add' || data.type === 'edge_add' || 
                   data.type === 'node_remove' || data.type === 'edge_remove') {
          // Forward updates to all clients in the same project room
          const connection = connections.get(connectionId);
          
          if (connection && connection.projectId) {
            const projectId = connection.projectId;
            
            if (projectRooms.has(projectId)) {
              const roomConnections = projectRooms.get(projectId);
              
              if (roomConnections) {
                // Broadcast to all other connections in the same room
                roomConnections.forEach((connId) => {
                  if (connId !== connectionId) { // Don't send back to sender
                    const targetConn = connections.get(connId);
                    if (targetConn && targetConn.ws.readyState === WebSocket.OPEN) {
                      targetConn.ws.send(JSON.stringify(data));
                    }
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        log(`Error processing WebSocket message: ${error}`, 'websocket');
      }
    });

    ws.on('close', () => {
      // Clean up when connection closes
      const connection = connections.get(connectionId);
      if (connection && connection.projectId) {
        const projectId = connection.projectId;
        
        if (projectId && projectRooms.has(projectId)) {
          const room = projectRooms.get(projectId);
          
          if (room) {
            room.delete(connectionId);
            
            // Remove project room if empty
            if (room.size === 0) {
              projectRooms.delete(projectId);
            }
          }
        }
      }
      
      // Remove the connection
      connections.delete(connectionId);
      log(`WebSocket connection closed: ${connectionId}`, 'websocket');
    });
  });

  // Add API endpoint to get mind map data for a project
  app.get("/api/projects/:id/mindmap", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // In a real implementation, this would fetch mind map data from database
      // For this example, we'll return a default structure
      res.json({
        nodes: [
          {
            id: 'project',
            type: 'custom',
            data: { 
              label: project.name,
              description: project.description || 'Project root node'
            },
            position: { x: 250, y: 50 }
          },
          {
            id: 'deliverables',
            type: 'custom',
            data: { 
              label: 'Deliverables',
              description: 'Project deliverables'
            },
            position: { x: 100, y: 200 }
          },
          {
            id: 'timeline',
            type: 'custom',
            data: { 
              label: 'Timeline',
              description: `Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}`
            },
            position: { x: 400, y: 200 }
          }
        ],
        edges: [
          {
            id: 'e-project-deliverables',
            source: 'project',
            target: 'deliverables',
            type: 'default'
          },
          {
            id: 'e-project-timeline',
            source: 'project',
            target: 'timeline',
            type: 'default'
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mind map data" });
    }
  });

  // Save mind map data for a project
  app.post("/api/projects/:id/mindmap", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const { nodes, edges } = req.body;
      
      if (!Array.isArray(nodes) || !Array.isArray(edges)) {
        return res.status(400).json({ message: "Invalid mind map data" });
      }
      
      // In a real implementation, this would save to database
      // For this example, just acknowledge receipt
      res.json({
        message: "Mind map saved successfully",
        projectId: id
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to save mind map" });
    }
  });

  return httpServer;
}
