import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, userLoginSchema, userRegistrationSchema } from "@shared/schema";
import { z } from "zod";
import createMemoryStore from "memorystore";

// TypeScript declaration for Express.User
declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// Function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Function to compare passwords
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express): void {
  // Create a MemoryStore for session storage
  const MemoryStore = createMemoryStore(session);
  
  // Set up session middleware
  app.use(
    session({
      cookie: { 
        maxAge: 86400000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-site cookies in production
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // Clear expired sessions every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' 
        ? randomBytes(32).toString('hex') // Generate secure random secret if not provided in production
        : "freelanly-dev-session-secret"),
    })
  );
  
  // Trust first proxy for secure cookies in production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure local strategy for passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isValidPassword = await comparePasswords(password, user.password);
        
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = userRegistrationSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed after registration" });
        }
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error('Registration error details:', error);
      
      // Более подробное сообщение об ошибке
      const errorMessage = error instanceof Error 
        ? `Registration failed: ${error.message}` 
        : "Registration failed";
      
      res.status(500).json({ error: errorMessage });
    }
  });
  
  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    try {
      // Validate the request body
      userLoginSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: UserType | false, info: { message: string }) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ error: info.message || "Authentication failed" });
        }
        
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    
    res.json(userWithoutPassword);
  });
  
  // Change password endpoint
  app.post("/api/user/change-password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      
      // Verify current password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update the user's password
      const updatedUser = await storage.updateUser(req.user.id, { password: hashedPassword });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update password" });
      }
      
      res.status(200).json({ message: "Password successfully updated" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  
  // Delete account endpoint
  app.delete("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      // Delete the user and all associated data
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete account" });
      }
      
      // Log the user out
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed after account deletion" });
        }
        
        res.status(200).json({ message: "Account successfully deleted" });
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete account" });
    }
  });
}