#!/usr/bin/env node

/**
 * Скрипт для безопасного запуска Drizzle миграций на Render.com
 * Обходит ошибку с pg_stat_statements_info
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Путь к временному конфигу
const tempConfigPath = path.join(process.cwd(), 'temp-drizzle-config.js');

try {
  // Создаем временный конфиг для Drizzle
  const configContent = `
module.exports = {
  out: "./migrations",
  schema: "./dist/shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  // Игнорируем системные вьюшки PostgreSQL
  ignore: {
    views: ["pg_stat_statements_info"],
  },
};
`;

  // Записываем временный конфиг
  fs.writeFileSync(tempConfigPath, configContent);
  console.log('Создан временный конфиг для Drizzle миграций...');

  // Запускаем миграцию с временным конфигом
  console.log('Запуск безопасной миграции Drizzle...');
  execSync(`npx drizzle-kit push:pg --config=${tempConfigPath}`, { 
    stdio: 'inherit'
  });

  console.log('Миграция успешно завершена!');

} catch (error) {
  console.error('Ошибка при миграции:', error.message);
  console.log('Продолжаем запуск приложения, несмотря на ошибку миграции...');
} finally {
  // Удаляем временный конфиг
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
    console.log('Удален временный конфиг');
  }
}