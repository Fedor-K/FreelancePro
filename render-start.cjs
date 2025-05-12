#!/usr/bin/env node

/**
 * Скрипт для запуска приложения на Render.com
 * Исправляет проблемы с подключением к PostgreSQL и миграциями Drizzle
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Определяем, откуда загружать URL для подключения к базе данных
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL not found in environment variables');
  process.exit(1);
}

// Исправляем URL подключения к базе данных, если он не содержит полное доменное имя
if (dbUrl && dbUrl.includes('dpg-') && !dbUrl.includes('postgres.render.com')) {
  const matches = dbUrl.match(/(postgres[ql]:\/\/.*?@)(dpg-[a-z0-9]+)/i);
  if (matches && matches.length >= 3) {
    const prefix = matches[1];
    const hostname = matches[2];
    const rest = dbUrl.slice(matches[0].length);
    
    const correctedUrl = `${prefix}${hostname}.frankfurt-postgres.render.com${rest}`;
    console.log(`Fixed DATABASE_URL: ${correctedUrl}`);
    process.env.DATABASE_URL = correctedUrl;
    dbUrl = correctedUrl;
  }
}

// Добавляем параметр ssl=true, если его нет
if (dbUrl && !dbUrl.includes('ssl=true') && !dbUrl.includes('?ssl=')) {
  process.env.DATABASE_URL = dbUrl + (dbUrl.includes('?') ? '&ssl=true' : '?ssl=true');
  console.log(`Added SSL parameter: ${process.env.DATABASE_URL}`);
}

// Создаем временный конфиг для миграций Drizzle
const tempConfigPath = path.join(process.cwd(), 'temp-drizzle-config.js');
const tempConfigContent = `
module.exports = {
  out: "./migrations",
  schema: "./shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "${process.env.DATABASE_URL.replace(/postgres:\/\//g, 'postgresql://')}",
  },
  // Игнорируем системные вьюшки PostgreSQL
  ignore: {
    views: ["pg_stat_statements_info"],
  },
};
`;

fs.writeFileSync(tempConfigPath, tempConfigContent);
console.log('Created temporary Drizzle configuration');

// Запускаем миграцию, игнорируя ошибки с pg_stat_statements_info
console.log('Running database migrations...');
try {
  const migrate = spawn('npx', ['drizzle-kit', 'push:pg', '--config=' + tempConfigPath], {
    stdio: 'inherit',
    shell: true
  });
  
  migrate.on('close', (code) => {
    if (code === 0 || code === null) {
      console.log('Migration completed successfully');
      startMainApplication();
    } else {
      console.log(`Migration exited with code ${code}, but continuing anyway`);
      startMainApplication();
    }
  });
  
  migrate.on('error', (err) => {
    console.error('Migration error:', err);
    startMainApplication(); // Продолжаем даже при ошибке
  });

} catch (error) {
  console.error('Failed to run migrations, but continuing:', error.message);
  startMainApplication();
}

function startMainApplication() {
  // Удаляем временный конфиг
  try {
    fs.unlinkSync(tempConfigPath);
    console.log('Removed temporary Drizzle configuration');
  } catch (err) {
    console.error('Failed to remove temporary config:', err.message);
  }

  // Запускаем основное приложение
  console.log('Starting main application...');
  const nodeProcess = spawn('node', ['dist/index.js'], {
    stdio: 'inherit', 
    env: { ...process.env, NODE_ENV: 'production' }
  });

  nodeProcess.on('close', (code) => {
    console.log(`Application exited with code ${code}`);
    process.exit(code);
  });
}