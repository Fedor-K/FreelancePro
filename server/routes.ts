import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertProjectSchema,
  insertResumeSchema,
  insertDocumentSchema,
  insertExternalDataSchema,
  webhookPayloadSchema
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { isValidApiKey, getApiKeySource } from "./config";
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './vite';

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
  // Client routes
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const result = insertClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid client data", errors: result.error.format() });
      }
      
      const client = await storage.createClient(result.data);
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
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      let projects;
      if (req.query.clientId) {
        const clientId = parseInt(req.query.clientId as string);
        if (isNaN(clientId)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
        projects = await storage.getProjectsByClient(clientId);
      } else {
        projects = await storage.getProjects();
      }
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      // Process the request data
      const data = { ...req.body };
      
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
      
      // Verify client exists
      const client = await storage.getClient(result.data.clientId);
      if (!client) {
        return res.status(400).json({ message: "Client not found" });
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

  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      console.log("PATCH request received for project with ID:", req.params.id);
      console.log("Request body:", req.body);
      
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

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
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

  // Resume routes
  app.get("/api/resumes", async (req: Request, res: Response) => {
    try {
      const resumes = await storage.getResumes();
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const resume = await storage.getResume(id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post("/api/resumes", async (req: Request, res: Response) => {
    try {
      const result = insertResumeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid resume data", errors: result.error.format() });
      }
      
      // Generate resume or cover letter content using OpenAI
      try {
        let prompt;
        
        // Check if we're generating a cover letter (identified by specialization)
        if (result.data.specialization === "Cover Letter") {
          // Extract additional data that might be passed for cover letter
          const targetCompany = (req.body.targetCompany as string) || "the prospective client";
          const jobDescription = (req.body.jobDescription as string) || "the freelance position";
          
          // Create a prompt for cover letter generation
          prompt = `Create a professional cover letter for ${result.data.name}, a freelance professional applying to ${targetCompany}.
          
          Professional Background: ${result.data.experience}
          
          Relevant Projects: ${result.data.projects}
          
          Job/Project Description: ${jobDescription}
          
          Format it professionally as a formal cover letter with:
          1. Current date
          2. Appropriate greeting
          3. Introduction paragraph mentioning the position
          4. Body paragraphs highlighting relevant skills and experience
          5. Closing paragraph with call to action
          6. Professional signature
          
          The cover letter should be persuasive and tailored to the specific opportunity, highlighting freelance expertise.`;
        } else {
          // Create a prompt for resume generation
          prompt = `Create a professional resume for a ${result.data.specialization} freelancer named ${result.data.name} with the following experience: ${result.data.experience}
          
          Include these projects: ${result.data.projects}
          
          Format the resume in a professional manner with clear sections for:
          1. Contact Information
          2. Professional Summary
          3. Skills
          4. Experience
          5. Education
          6. Projects
          
          The resume should highlight freelance expertise and be optimized for getting freelance clients in the field of ${result.data.specialization}.`;
        }
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
        });
        
        const resumeContent = response.choices[0].message.content || "Failed to generate resume content.";
        
        const resume = await storage.createResume({
          ...result.data,
          content: resumeContent
        });
        
        res.status(201).json(resume);
      } catch (error) {
        console.error("OpenAI error:", error);
        res.status(500).json({ message: "Failed to generate resume content" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.delete("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      const success = await storage.deleteResume(id);
      if (!success) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });
  
  // Update an existing resume
  app.patch("/api/resumes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }
      
      // Check if resume exists
      const existingResume = await storage.getResume(id);
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Validate input data
      const result = insertResumeSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid resume data", errors: result.error.format() });
      }
      
      // Generate updated resume content using OpenAI
      try {
        // Only regenerate content if relevant fields have changed
        if (result.data.name || result.data.specialization || result.data.experience || result.data.projects) {
          // Create a prompt for resume generation
          const prompt = `Create a professional resume for a ${result.data.specialization || existingResume.specialization} freelancer named ${result.data.name || existingResume.name} with the following experience: ${result.data.experience || existingResume.experience}
          
          Include these projects: ${result.data.projects || existingResume.projects}
          
          Format the resume in a professional manner with clear sections for:
          1. Contact Information
          2. Professional Summary
          3. Skills
          4. Experience
          5. Education
          6. Projects
          
          The resume should highlight freelance expertise and be optimized for getting freelance clients in the field of ${result.data.specialization || existingResume.specialization}.`;
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1500,
          });
          
          const resumeContent = response.choices[0].message.content || "Failed to generate resume content.";
          
          // Add content to the update data
          result.data.content = resumeContent;
        }
        
        // Update the resume
        const updatedResume = await storage.updateResume(id, result.data);
        res.json(updatedResume);
      } catch (error) {
        console.error("OpenAI error:", error);
        res.status(500).json({ message: "Failed to update resume content" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      let documents;
      if (req.query.projectId) {
        const projectId = parseInt(req.query.projectId as string);
        if (isNaN(projectId)) {
          return res.status(400).json({ message: "Invalid project ID" });
        }
        documents = await storage.getDocumentsByProject(projectId);
      } else {
        documents = await storage.getDocuments();
      }
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  
  app.patch("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid document ID" });
      }
      
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
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

  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store active connections and their project rooms
  const connections = new Map();
  const projectRooms = new Map();

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
          projectRooms.get(projectId).add(connectionId);
          
          // Update connection data
          connections.get(connectionId).projectId = projectId;
          
          log(`Client ${connectionId} joined project ${projectId}`, 'websocket');
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'joined',
            projectId,
            status: 'success'
          }));
        } 
        else if (data.type === 'node_update' || data.type === 'edge_update' || 
                 data.type === 'node_add' || data.type === 'edge_add' || 
                 data.type === 'node_remove' || data.type === 'edge_remove') {
          // Forward updates to all clients in the same project room
          const connection = connections.get(connectionId);
          const projectId = connection.projectId;
          
          if (projectId && projectRooms.has(projectId)) {
            const roomConnections = projectRooms.get(projectId);
            
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
      } catch (error) {
        log(`Error processing WebSocket message: ${error}`, 'websocket');
      }
    });

    ws.on('close', () => {
      // Clean up when connection closes
      const connection = connections.get(connectionId);
      if (connection && connection.projectId) {
        const projectId = connection.projectId;
        if (projectRooms.has(projectId)) {
          projectRooms.get(projectId).delete(connectionId);
          
          // Remove project room if empty
          if (projectRooms.get(projectId).size === 0) {
            projectRooms.delete(projectId);
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
