import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Настройка WebSocket для Neon
try {
  // Базовые настройки
  neonConfig.webSocketConstructor = ws;
  neonConfig.useSecureWebSocket = true;
  
  // Проверяем доступность дополнительных настроек и применяем их
  // Не используем @ts-ignore, чтобы избежать ошибок компиляции
  const neonConfigAny = neonConfig as any;
  
  if (typeof neonConfigAny.pipelineConnect !== 'undefined') {
    console.log('Настройка расширенных параметров Neon WebSocket...');
    neonConfigAny.pipelineConnect = false;
  }
  
  // Пробуем создать прокси для WebSocket с расширенными таймаутами
  if (typeof neonConfigAny.wsProxy === 'function') {
    const originalWsProxy = neonConfigAny.wsProxy;
    neonConfigAny.wsProxy = (host: string, port: string | number) => {
      console.log(`Создание WebSocket прокси для ${host}:${port}`);
      return originalWsProxy(host, port);
    };
  }
  
  console.log('Neon WebSocket настройки успешно применены');
} catch (err) {
  console.error('Ошибка при настройке Neon WebSocket:', err);
  // Продолжаем выполнение с базовыми настройками
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Получаем URL подключения к базе данных
let connectionString = process.env.DATABASE_URL;

// Санитизированная версия URL для логирования (скрываем пароль)
const getSafeUrl = (url: string) => url.replace(/:[^@:]*@/, ':***@');

console.log('Анализ URL базы данных...');

// Определяем тип URL базы данных
const isInternalUrl = connectionString && /\b10\.\d+\.\d+\.\d+\b/.test(connectionString);
const isRenderPostgres = connectionString && connectionString.includes('dpg-');
const isNeonPostgres = connectionString && connectionString.includes('neon.tech');
const isLocalPostgres = connectionString && (
  connectionString.includes('localhost') || 
  connectionString.includes('127.0.0.1')
);

// Выводим информацию о типе базы данных (без реальных данных)
console.log('Тип подключения:', 
  isInternalUrl ? 'Render внутренний URL' :
  isRenderPostgres ? 'Render PostgreSQL' :
  isNeonPostgres ? 'Neon PostgreSQL' :
  isLocalPostgres ? 'Локальный PostgreSQL' : 'Другой тип URL'
);

// Обработка разных типов URL
if (isInternalUrl) {
  console.log('Обнаружен внутренний URL базы данных Render. Фиксируем порт...');
  // Для внутренних URL принудительно устанавливаем порт 5432
  const originalUrl = connectionString;
  connectionString = connectionString.replace(/:[0-9]+\//, ':5432/');
  
  if (originalUrl !== connectionString) {
    console.log('URL после исправления порта:', getSafeUrl(connectionString));
  } else {
    console.log('Порт уже был указан как 5432, корректировка не требуется');
  }
} 
else if (isRenderPostgres && !connectionString.includes('.postgres.render.com')) {
  console.log('Обнаружен внешний URL базы данных Render без полного домена. Исправляем...');
  
  // Находим ID хоста (dpg-xxx)
  const matches = connectionString.match(/(postgres[ql]:\/\/.*?@)(dpg-[a-z0-9]+)/i);
  if (matches && matches.length >= 3) {
    const prefix = matches[1]; // postgres://user:pass@
    const hostId = matches[2]; // dpg-xxx
    const restOfUrl = connectionString.substring(matches[0].length); // /dbname
    
    // Собираем полный URL с добавлением домена региона
    const originalUrl = connectionString;
    connectionString = `${prefix}${hostId}.frankfurt-postgres.render.com${restOfUrl}`;
    
    if (originalUrl !== connectionString) {
      console.log('Домен добавлен к URL');
    }
  }
  
  // Добавляем параметр ssl=true только для внешних подключений
  if (!connectionString.includes('ssl=true') && !connectionString.includes('sslmode=require')) {
    const originalUrl = connectionString;
    connectionString += connectionString.includes('?') ? '&ssl=true' : '?ssl=true';
    
    if (originalUrl !== connectionString) {
      console.log('Добавлен параметр SSL для внешнего доступа');
    }
  }
}
else if (isNeonPostgres) {
  console.log('Обнаружен URL базы данных Neon. Проверяем параметры SSL...');
  
  // Добавляем параметр sslmode=require, если его нет
  if (!connectionString.includes('sslmode=') && !connectionString.includes('ssl=')) {
    const originalUrl = connectionString;
    connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
    
    if (originalUrl !== connectionString) {
      console.log('Добавлен параметр sslmode=require для Neon PostgreSQL');
    }
  }
}
else {
  console.log('Используем URL базы данных без изменений');
}

// Определяем настройки SSL в зависимости от типа URL
let sslConfig: boolean | object = false;

if (!isInternalUrl && !isLocalPostgres) {
  // Для внешних подключений включаем SSL с рекомендуемыми настройками
  sslConfig = {
    rejectUnauthorized: true, // Для Render и Neon PostgreSQL
  };
  
  console.log('SSL включен для подключения к базе данных');
} else {
  console.log('SSL отключен для внутреннего/локального подключения');
}

// Опции для улучшения подключения
const poolConfig = {
  connectionString: connectionString,
  max: 10,                  // Максимум 10 одновременных соединений
  idleTimeoutMillis: 30000, // Таймаут неактивных соединений
  connectionTimeoutMillis: 20000, // Таймаут установки соединения
  ssl: sslConfig,
  // Дополнительные настройки для стабильности
  allowExitOnIdle: false,   // Не завершать соединение при простое
  maxUses: 7500,            // Максимальное количество запросов на одно соединение
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
      // Более подробный вывод ошибки для диагностики
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      
      // Выводим подробную информацию об ошибке
      console.error(`Connection attempt ${attemptCount}/${maxAttempts} failed:`);
      if (typeof err === 'object' && err !== null) {
        console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      } else {
        console.error('Error:', err);
      }
      
      // Для ошибок WebSocket-подключения к Neon
      if (err instanceof Error && err.message.includes('WebSocket')) {
        console.error('WebSocket connection error detected. This may be due to network connectivity issues with Neon PostgreSQL.');
      }
      
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
  
  // Модифицируем конфиг для последней попытки
  const fallbackConfig = { 
    ...poolConfig,
    // Увеличиваем тайм-ауты для больших данных
    connectionTimeoutMillis: 60000, // 60 секунд на подключение
    statement_timeout: 60000,       // 60 секунд на запрос
    query_timeout: 60000,           // 60 секунд на запрос
    // Отключаем keepalive, чтобы избежать проблем с прокси
    keepAlive: false
  };
  
  console.log('Using fallback connection configuration');
  return new Pool(fallbackConfig);
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
