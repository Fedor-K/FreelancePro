import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Strong type definition with validation for user registration
export const userRegistrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().optional(),
});

// Login schema
export const userLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// External data schema
export const externalData = pgTable("external_data", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  dataType: text("data_type").notNull(),
  content: json("content").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
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
  userId: integer("user_id").references(() => users.id),
});

export const insertProjectSchema = createInsertSchema(projects, {
  deadline: z.string().or(z.date()).nullable().optional().transform(val => val ? new Date(val) : null),
}).omit({
  id: true,
});



// Document schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'invoice' or 'contract'
  projectId: integer("project_id").references(() => projects.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

// Define types from schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ExternalData = typeof externalData.$inferSelect;
export type InsertExternalData = z.infer<typeof insertExternalDataSchema>;

// Resume schema
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'resume' or 'cover_letter'
  content: text("content").notNull(),
  projectId: integer("project_id").references(() => projects.id),
  targetPosition: text("target_position"),
  targetCompany: text("target_company"),
  htmlContent: text("html_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

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
