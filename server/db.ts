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

// Получаем URL подключения к базе данных
let connectionString = process.env.DATABASE_URL;

// Определяем, используется ли внутренний URL Render (10.x.x.x)
const isInternalUrl = connectionString && /\b10\.\d+\.\d+\.\d+\b/.test(connectionString);

if (isInternalUrl) {
  console.log('Обнаружен внутренний URL базы данных Render. Фиксируем порт...');
  // Для внутренних URL принудительно устанавливаем порт 5432
  connectionString = connectionString.replace(/:[0-9]+\//, ':5432/');
  console.log('URL после исправления порта:', connectionString.replace(/:[^@:]*@/, ':***@'));
} else if (connectionString && connectionString.includes('dpg-') && !connectionString.includes('.postgres.render.com')) {
  console.log('Обнаружен внешний URL базы данных Render без полного домена. Исправляем...');
  
  // Находим ID хоста (dpg-xxx)
  const matches = connectionString.match(/(postgres[ql]:\/\/.*?@)(dpg-[a-z0-9]+)/i);
  if (matches && matches.length >= 3) {
    const prefix = matches[1]; // postgres://user:pass@
    const hostId = matches[2]; // dpg-xxx
    const restOfUrl = connectionString.substring(matches[0].length); // /dbname
    
    // Собираем полный URL с добавлением домена региона
    connectionString = `${prefix}${hostId}.frankfurt-postgres.render.com${restOfUrl}`;
    console.log('URL исправлен для внешнего доступа');
  }
  
  // Добавляем параметр ssl=true только для внешних подключений
  if (!connectionString.includes('ssl=true')) {
    connectionString += connectionString.includes('?') ? '&ssl=true' : '?ssl=true';
    console.log('Добавлен параметр SSL для внешнего доступа');
  }
}

// Опции для улучшения подключения
const poolConfig = {
  connectionString: connectionString,
  max: 10,                  // Максимум 10 одновременных соединений
  idleTimeoutMillis: 30000, // Таймаут неактивных соединений
  connectionTimeoutMillis: 20000, // Таймаут установки соединения
  // Включаем SSL только для внешних подключений, для внутренних он не нужен
  ssl: !isInternalUrl
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
