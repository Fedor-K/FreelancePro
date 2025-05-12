import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Установка конструктора WebSocket для Neon
neonConfig.webSocketConstructor = ws;

// Использовать защищенное соединение
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Исправляем URL для Render.com, если он содержит неполный домен
let connectionString = process.env.DATABASE_URL;

// Проверяем, что URL содержит dpg- (характерное начало ID хоста на Render PostgreSQL)
if (connectionString.includes('dpg-') && !connectionString.includes('.postgres.render.com')) {
  console.log('Неполный URL базы данных на Render. Исправляем...');
  
  // Находим ID хоста (dpg-xxx)
  const matches = connectionString.match(/(postgres[ql]:\/\/.*?@)(dpg-[a-z0-9]+)/i);
  if (matches && matches.length >= 3) {
    const prefix = matches[1]; // postgres://user:pass@
    const hostId = matches[2]; // dpg-xxx
    const restOfUrl = connectionString.substring(matches[0].length); // /dbname
    
    // Собираем полный URL с добавлением домена региона
    connectionString = `${prefix}${hostId}.frankfurt-postgres.render.com${restOfUrl}`;
    console.log('Исправленный URL:', connectionString);
  }
}

// Добавляем параметр ssl=true, если его нет
if (!connectionString.includes('ssl=true')) {
  connectionString += connectionString.includes('?') ? '&ssl=true' : '?ssl=true';
  console.log('Добавлен параметр SSL');
}

// Опции для улучшения подключения
const poolConfig = {
  connectionString: connectionString,
  max: 10,                  // Максимум 10 одновременных соединений
  idleTimeoutMillis: 30000, // Таймаут неактивных соединений
  connectionTimeoutMillis: 20000, // Таймаут установки соединения
  ssl: true                 // Принудительно использовать SSL
};

console.log('Connecting to database...');
export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });

// Проверка подключения к базе данных
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Successfully connected to the database!');
    done(); // Возвращаем клиент в пул
  }
});
