/**
 * Скрипт для безопасного запуска Drizzle миграций на Render.com
 * Обходит ошибку с pg_stat_statements_info
 */

const { execSync } = require('child_process');
const fs = require('fs');

// Шаг 1: Создаем временный конфиг Drizzle
function createTempConfig() {
  console.log('Создание временного конфига Drizzle...');
  
  // Определяем, используется ли внутренний URL (проверяем наличие 10.x.x.x)
  const isInternalUrl = process.env.DATABASE_URL && /\b10\.\d+\.\d+\.\d+\b/.test(process.env.DATABASE_URL);
  
  const config = {
    out: "./migrations",
    schema: "./shared/schema.ts",  // в Production это будет "./dist/shared/schema.js"
    dialect: "postgresql",
    dbCredentials: {
      connectionString: process.env.DATABASE_URL,
      ssl: !isInternalUrl, // Отключаем SSL для внутренних URL
    },
    // Игнорируем системные вьюшки PostgreSQL
    ignore: {
      views: ["pg_stat_statements_info", "pg_stat_statements"],
    },
    // Дополнительные настройки для стабильности
    verbose: true,
    strict: false,
  };

  // Для Production среды, указываем на скомпилированный файл схемы
  if (process.env.NODE_ENV === 'production') {
    config.schema = "./dist/shared/schema.js";
  }

  fs.writeFileSync('temp-drizzle-config.js', 
    `module.exports = ${JSON.stringify(config, null, 2)};`);

  console.log('Временный конфиг создан');
}

// Шаг 2: Обработка URL базы данных
function processDbUrl() {
  let connectionString = process.env.DATABASE_URL;
  console.log('Соединение с базой данных...');

  // Обрабатываем чувствительную информацию для логов
  function sanitizeUrl(url) {
    return url.replace(/:[^@:]*@/, ':***@');
  }

  // Определяем, используется ли внутренний URL Render (10.x.x.x)
  const isInternalUrl = connectionString && /\b10\.\d+\.\d+\.\d+\b/.test(connectionString);

  if (isInternalUrl) {
    console.log('Обнаружен внутренний URL базы данных Render. Фиксируем порт...');
    
    // Для внутренних URL принудительно устанавливаем порт 5432
    const originalUrl = connectionString;
    connectionString = connectionString.replace(/:[0-9]+\//, ':5432/');
    
    // Если URL изменился, выводим новый (безопасный) URL
    if (originalUrl !== connectionString) {
      console.log(`Порт исправлен в URL: ${sanitizeUrl(connectionString)}`);
      process.env.DATABASE_URL = connectionString;
    }
  } 
  else if (connectionString && connectionString.includes('dpg-') && !connectionString.includes('.postgres.render.com')) {
    console.log('Обнаружен внешний URL базы данных Render без полного домена.');
    
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
        console.log('Домен исправлен в URL');
        process.env.DATABASE_URL = connectionString;
      }
    }
    
    // Добавляем параметр ssl=true или sslmode=require, если его нет
    if (!connectionString.includes('ssl=true') && !connectionString.includes('sslmode=require')) {
      const originalUrl = connectionString;
      connectionString += connectionString.includes('?') ? '&ssl=true' : '?ssl=true';
      
      if (originalUrl !== connectionString) {
        console.log('SSL параметр добавлен в URL');
        process.env.DATABASE_URL = connectionString;
      }
    }
  }
  else {
    console.log('URL базы данных не требует корректировки');
  }
}

// Шаг 3: Запуск миграции с обработкой ошибок
function runMigration() {
  console.log('Запуск безопасной миграции Drizzle...');
  
  const ignorableErrors = [
    'pg_stat_statements_info',
    'pg_stat_statements',
    'cannot drop view',
  ];
  
  try {
    // Сначала проверяем коннект без миграции
    console.log('Проверка соединения с базой данных перед миграцией...');
    execSync(`node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('10.') ? false : {rejectUnauthorized: true}}); pool.query('SELECT NOW()', (err, res) => { if(err) { console.error(err); process.exit(1); } else { console.log('Соединение с базой данных успешно!'); pool.end(); }})"`, {
      stdio: 'inherit',
      env: process.env
    });
    
    // Если соединение успешно, запускаем миграцию
    console.log('Запуск миграции Drizzle...');
    execSync('npx drizzle-kit push:pg --config=temp-drizzle-config.js', { 
      stdio: 'inherit',
      env: process.env
    });
    console.log('Миграция успешно завершена');
  } catch (error) {
    // Проверяем на игнорируемые ошибки
    const errorMessage = String(error.message || error);
    
    const isIgnorableError = ignorableErrors.some(errText => 
      errorMessage.includes(errText)
    );
    
    if (isIgnorableError) {
      console.log('Обнаружена ожидаемая ошибка миграции, которую можно игнорировать:');
      console.log(errorMessage.split('\n')[0]); // Показываем только первую строку ошибки
      console.log('Приложение должно работать нормально, продолжаем запуск.');
      
      // Пытаемся проверить базу данных после ошибки
      try {
        console.log('Проверка структуры базы данных...');
        execSync(`node -e "const { Pool } = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('10.') ? false : {rejectUnauthorized: true}}); pool.query('SELECT count(*) FROM information_schema.tables WHERE table_schema = \\'public\\'', (err, res) => { if(err) { console.error(err); } else { console.log('Найдено таблиц в базе данных: ' + res.rows[0].count); pool.end(); }})"`, {
          stdio: 'inherit',
          env: process.env
        });
      } catch (dbError) {
        console.error('Ошибка при проверке структуры базы данных:', dbError.message);
      }
    } else {
      console.error('Критическая ошибка при выполнении миграции:');
      console.error(errorMessage);
      process.exit(1); // Выходим с ошибкой только для критических ошибок
    }
  }
}

// Шаг 4: Очистка временных файлов
function cleanup() {
  console.log('Удаление временных файлов...');
  try {
    fs.unlinkSync('temp-drizzle-config.js');
    console.log('Временный конфиг удален');
  } catch (error) {
    console.warn('Не удалось удалить временный файл конфигурации:', error.message);
  }
}

// Основная логика
function main() {
  console.log('--- Запуск безопасной миграции базы данных ---');
  processDbUrl();
  createTempConfig();
  runMigration();
  cleanup();
  console.log('--- Миграция базы данных завершена ---');
}

main();