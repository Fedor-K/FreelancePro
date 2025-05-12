#!/bin/bash

# Скрипт для запуска приложения на Render.com
# Исправляет проблемы с базой данных, миграциями и поддерживает разные типы URL

# Функция для безопасного вывода URL (скрывает пароль)
function safe_url() {
  echo "$1" | sed -E 's/:[^@:]*@/:***@/g'
}

echo "===================== FREELANLY APP STARTUP ====================="
echo "Запуск приложения в Render.com"
echo "Дата и время: $(date)"
echo "Версия Node.js: $(node -v)"
echo "Версия NPM: $(npm -v)"
echo "==============================================================="

# Определяем тип URL базы данных
if echo "$DATABASE_URL" | grep -q "10\.[0-9]\+\.[0-9]\+\.[0-9]\+"; then
  echo "Обнаружен внутренний URL базы данных Render"
  
  # Исправляем порт для внутренней сети (часто Render использует 443 вместо 5432)
  # Используем временную переменную чтобы не показывать пароль при отладке
  ORIGINAL_URL=$DATABASE_URL
  
  # Применяем регулярное выражение для замены порта
  export DATABASE_URL=$(echo "$ORIGINAL_URL" | sed -E 's/:[0-9]+\///:5432\//g')
  
  # Проверяем, изменился ли URL
  if [ "$ORIGINAL_URL" != "$DATABASE_URL" ]; then
    echo "Порт в URL базы данных исправлен с 443 на 5432"
    echo "URL после исправления: $(safe_url "$DATABASE_URL")"
  else 
    echo "Порт уже установлен как 5432, коррекция не требуется"
  fi
  
  # Отключаем SSL для внутренних соединений
  echo "SSL отключен для внутреннего соединения"
elif echo "$DATABASE_URL" | grep -q "dpg-"; then
  echo "Обнаружен внешний URL базы данных Render PostgreSQL"
  
  # Проверяем, содержит ли URL полное доменное имя
  if ! echo "$DATABASE_URL" | grep -q "postgres.render.com"; then
    # Получаем идентификатор хоста
    HOST_ID=$(echo "$DATABASE_URL" | sed -E 's|.+@(dpg-[a-z0-9-]+).*|\1|')
    ORIGINAL_URL=$DATABASE_URL
    FIXED_URL=$(echo "$DATABASE_URL" | sed -E "s|(@$HOST_ID)|\\1.frankfurt-postgres.render.com|")
    
    # Проверяем, изменился ли URL
    if [ "$ORIGINAL_URL" != "$FIXED_URL" ]; then
      export DATABASE_URL="$FIXED_URL"
      echo "Домен добавлен к URL базы данных"
    fi
  fi
  
  # Добавляем SSL параметр, если его нет
  if ! echo "$DATABASE_URL" | grep -q "ssl=true" && ! echo "$DATABASE_URL" | grep -q "sslmode=require"; then
    ORIGINAL_URL=$DATABASE_URL
    
    if echo "$DATABASE_URL" | grep -q "\?"; then
      export DATABASE_URL="${DATABASE_URL}&ssl=true"
    else
      export DATABASE_URL="${DATABASE_URL}?ssl=true"
    fi
    
    # Проверяем, изменился ли URL
    if [ "$ORIGINAL_URL" != "$DATABASE_URL" ]; then
      echo "Параметр SSL добавлен к URL базы данных"
    fi
  fi
  
  echo "Используем SSL для внешнего соединения"
elif echo "$DATABASE_URL" | grep -q "neon.tech"; then
  echo "Обнаружен URL базы данных Neon PostgreSQL"
  
  # Проверяем параметры SSL
  if ! echo "$DATABASE_URL" | grep -q "ssl=true" && ! echo "$DATABASE_URL" | grep -q "sslmode=require"; then
    ORIGINAL_URL=$DATABASE_URL
    
    if echo "$DATABASE_URL" | grep -q "\?"; then
      export DATABASE_URL="${DATABASE_URL}&sslmode=require"
    else
      export DATABASE_URL="${DATABASE_URL}?sslmode=require"
    fi
    
    # Проверяем, изменился ли URL
    if [ "$ORIGINAL_URL" != "$DATABASE_URL" ]; then
      echo "Параметр sslmode=require добавлен к URL базы данных Neon"
    fi
  fi
  
  echo "Используем WebSocket соединение для Neon PostgreSQL"
else
  echo "Обнаружен стандартный URL базы данных PostgreSQL"
  echo "Используем URL базы данных без изменений"
fi

echo "Итоговый URL (скрыт пароль): $(safe_url "$DATABASE_URL")"

# Проверяем наличие файла drizzle-push-safe.js
if [ -f "drizzle-push-safe.js" ]; then
  echo "Запуск безопасной миграции базы данных..."
  NODE_ENV=production node drizzle-push-safe.js
else
  echo "ПРЕДУПРЕЖДЕНИЕ: Файл drizzle-push-safe.js не найден!"
  echo "Создаем временную конфигурацию для миграции..."
  
  # Создаем временный конфиг для Drizzle
  cat > temp-drizzle-config.js << EOL
module.exports = {
  out: "./migrations",
  schema: "./dist/shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
    ssl: !process.env.DATABASE_URL.includes('10.'),
  },
  ignore: {
    views: ["pg_stat_statements_info", "pg_stat_statements"],
  },
  verbose: true,
  strict: false,
};
EOL
  
  echo "Запуск миграции с временной конфигурацией..."
  npx drizzle-kit push:pg --config=temp-drizzle-config.js || echo "Миграция завершилась с ошибками, но мы продолжаем запуск..."
  rm temp-drizzle-config.js
fi

echo "==============================================================="
echo "Запуск основного приложения..."
echo "==============================================================="
NODE_ENV=production node dist/index.js