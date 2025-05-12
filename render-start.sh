#!/bin/bash

# Скрипт для запуска приложения на Render.com
# Исправляет проблемы с базой данных и миграциями

# 1. Создаем временный конфиг для Drizzle
echo "Создание безопасного конфига для Drizzle..."
cat > temp-drizzle-config.js << 'EOL'
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
EOL

# 2. Запускаем миграцию Drizzle с безопасным конфигом
echo "Запуск безопасной миграции Drizzle..."
npx drizzle-kit push:pg --config=temp-drizzle-config.js || echo "Игнорируем ошибку миграции..."

# 3. Удаляем временный конфиг
rm temp-drizzle-config.js

# 4. Запускаем основное приложение
echo "Запуск основного приложения..."
NODE_ENV=production node dist/index.js