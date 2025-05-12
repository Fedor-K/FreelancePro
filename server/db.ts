import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Настройка WebSocket для Neon (поддерживаемые опции)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

// Добавляем настройки таймаута на уровне сокета
// Эти опции поддерживаются в @neondatabase/serverless
if ('pipelineConnect' in neonConfig) {
  // @ts-ignore - Опциональные настройки, которые могут быть в новых версиях
  neonConfig.pipelineConnect = false;
}

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

// Создаем функцию для подключения с повторными попытками
const connectWithRetry = async (maxAttempts = 5, delay = 3000): Promise<Pool> => {
  let lastError: Error = new Error("No connection attempts made");
  let attemptCount = 0;

  while (attemptCount < maxAttempts) {
    attemptCount++;
    try {
      // Создаем пул подключений
      const pool = new Pool(poolConfig);
      
      // Проверяем соединение
      const client = await pool.connect();
      console.log(`Successfully connected to the database! (attempt ${attemptCount}/${maxAttempts})`);
      client.release();
      
      return pool;
    } catch (err) {
      // Преобразуем ошибку в тип Error
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      console.error(`Connection attempt ${attemptCount}/${maxAttempts} failed:`, error.message);
      
      // Если это последняя попытка, не ждем
      if (attemptCount < maxAttempts) {
        console.log(`Waiting ${delay/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Если все попытки не удались, возвращаем пул без проверки соединения
  console.error(`All ${maxAttempts} connection attempts failed. Last error:`, lastError.message);
  console.log('Creating pool without connection check...');
  return new Pool(poolConfig);
};

// Экспортируем пул и db с правильными типами
export let pool: Pool | undefined;
export let db: ReturnType<typeof drizzle> | undefined;

// Инициализируем подключение (асинхронно)
(async () => {
  try {
    pool = await connectWithRetry();
    db = drizzle({ client: pool, schema });
    console.log('Database connection initialized and ready to use.');
  } catch (err) {
    // Преобразуем ошибку в тип Error
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Failed to initialize database connection:', error.message);
    // В этом случае pool и db останутся undefined
    // Приложение будет выдавать ошибки при попытке обращения к БД
  }
})();
