import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// External data schema
export const externalData = pgTable("external_data", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  dataType: text("data_type").notNull(),
  content: json("content").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExternalDataSchema = createInsertSchema(externalData).omit({
  id: true,
  processed: true,
  createdAt: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  language: text("language"),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

// Project status enum
export const projectStatusEnum = pgEnum("project_status", [
  "In Progress",
  "Delivered",
  "Paid",
]);

// Project label enum
export const projectLabelEnum = pgEnum("project_label", [
  "Invoice sent",
  "Mark as paid",
  "Past",
  "Archive",
  "Make invoice",
  "Overdue",
  "To be delivered",
  "Deadline approaching"
]);

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  amount: doublePrecision("amount"),
  volume: integer("volume"),  // Character count
  sourceLang: text("source_lang"),
  targetLang: text("target_lang"),
  status: projectStatusEnum("status").notNull().default("In Progress"),
  labels: text("labels").array(),  // Store multiple labels
  invoiceSent: boolean("invoice_sent").default(false),
  isPaid: boolean("is_paid").default(false),
  isArchived: boolean("is_archived").default(false),
});

export const insertProjectSchema = createInsertSchema(projects, {
  deadline: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
}).omit({
  id: true,
});

// Resume schema
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  experience: text("experience").notNull(),
  projects: text("projects").notNull(),
  content: text("content").notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  content: true,
});

// Create a schema for resume updates that includes the content field
export const resumeUpdateSchema = z.object({
  name: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  projects: z.string().optional(),
  content: z.string().optional(),
  targetProject: z.string().optional(), // Used for resume generation but not stored
  isEditing: z.boolean().optional(), // Flag to indicate edit operation
  useAdditionalSettings: z.boolean().optional(), // Flag for using additional settings
});

// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'invoice' or 'contract'
  projectId: integer("project_id").references(() => projects.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Define types from schemas
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ExternalData = typeof externalData.$inferSelect;
export type InsertExternalData = z.infer<typeof insertExternalDataSchema>;

// Define webhook payload schema
export const webhookPayloadSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  sourcePlatform: z.string().optional(),
  sourceUrl: z.string().optional(),
  postedAt: z.string().datetime().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  langPairs: z.array(z.object({
    sourceLanguage: z.string(),
    targetLanguage: z.string()
  })).optional(),
  skills: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  jobType: z.string().optional(),
  deadline: z.string().datetime().optional(),
  rate: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactName: z.string().optional(),
  rawContent: z.string().optional(),
  // Keeping the generic data field for any additional fields
  data: z.record(z.any()).optional()
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
