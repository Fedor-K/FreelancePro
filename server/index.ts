import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Optional dotenv loading (only in development)
try {
  const dotenv = require('dotenv');
  dotenv.config();
  console.log('Environment variables loaded from .env file');
} catch (error) {
  console.log('Dotenv not available, using existing environment variables');
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Детальное логирование ошибок
    console.error('Server error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    });

    // Установка статуса ошибки
    const status = err.status || err.statusCode || 500;
    
    // Формирование сообщения об ошибке в зависимости от типа
    let errorResponse: any = {
      error: "Internal Server Error",
    };
    
    // Обработка специфических ошибок
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      errorResponse = {
        error: "Database connection error",
        message: "Could not connect to the database. Please try again later.",
      };
    } else if (err.code === 'ENOTFOUND') {
      errorResponse = {
        error: "Network error",
        message: "Could not resolve hostname. Please check your network connection.",
      };
    } else if (err.name === 'ValidationError' || err.name === 'ZodError') {
      errorResponse = {
        error: "Validation error",
        message: err.message,
        details: err.errors || []
      };
    } else {
      // Для всех остальных ошибок отдаем сообщение, если оно есть
      errorResponse = {
        error: err.message || "Internal Server Error"
      };
    }
    
    // Не отправляем стек ошибки в продакшн среде
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
    }
    
    // Отправляем ответ клиенту
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
