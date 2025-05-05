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
  "New",
  "In Progress",
  "Paid",
  "Completed",
]);

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  deadline: timestamp("deadline"),
  amount: doublePrecision("amount"),
  status: projectStatusEnum("status").notNull().default("New"),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
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
  name: z.string().optional(),
  email: z.string().email().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  data: z.record(z.any()).optional()
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
