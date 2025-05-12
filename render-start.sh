#!/bin/bash

# Скрипт для запуска приложения на Render.com
# Исправляет проблемы с базой данных и миграциями

# Выводим информацию о типе URL базы данных
if echo "$DATABASE_URL" | grep -q "10\.[0-9]\+\.[0-9]\+\.[0-9]\+"; then
  echo "Обнаружен внутренний URL базы данных Render. Использование внутренней сети..."
else
  echo "Обнаружен внешний URL базы данных. Проверка формата URL..."
  
  # Проверяем, содержит ли URL полное доменное имя
  if echo "$DATABASE_URL" | grep -q "dpg-" && ! echo "$DATABASE_URL" | grep -q "postgres.render.com"; then
    # Получаем идентификатор хоста
    HOST_ID=$(echo "$DATABASE_URL" | sed -E 's|.+@(dpg-[a-z0-9-]+).*|\1|')
    FIXED_URL=$(echo "$DATABASE_URL" | sed -E "s|(@$HOST_ID)|\\1.frankfurt-postgres.render.com|")
    
    # Добавляем SSL параметр, если его нет
    if ! echo "$FIXED_URL" | grep -q "ssl=true"; then
      if echo "$FIXED_URL" | grep -q "\?"; then
        FIXED_URL="${FIXED_URL}&ssl=true"
      else
        FIXED_URL="${FIXED_URL}?ssl=true"
      fi
    fi
    
    echo "URL базы данных был исправлен для внешнего доступа"
    export DATABASE_URL="$FIXED_URL"
  fi
fi

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