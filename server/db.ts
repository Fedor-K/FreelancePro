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

// Опции для улучшения подключения
// Важно: для Neon PostgreSQL необходимо использовать правильный формат URL:
// postgres://username:password@hostname.region-postgres.render.com/dbname?ssl=true
// Обратите внимание на '.region-postgres.render.com' в имени хоста и '?ssl=true' в конце
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
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
