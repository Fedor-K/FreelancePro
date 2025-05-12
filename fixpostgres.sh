#!/bin/bash
#
# Скрипт создает все необходимые файлы для корректной работы с PostgreSQL в Render.com
# Запускать перед деплоем:
# chmod +x fixpostgres.sh && ./fixpostgres.sh && npm run build
#

echo "==============================================================="
echo "FREELANLY DATABASE SETUP FOR RENDER.COM"
echo "==============================================================="

# Проверка наличия критичных файлов
NEEDED_FILES=(render-start.sh drizzle-push-safe.js)
MISSING_FILES=()

for file in "${NEEDED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    MISSING_FILES+=("$file")
  fi
done

# Предупреждение если файлы отсутствуют
if [ ${#MISSING_FILES[@]} -gt 0 ]; then
  echo "ПРЕДУПРЕЖДЕНИЕ: Следующие файлы не найдены:"
  for missing in "${MISSING_FILES[@]}"; do
    echo "  - $missing"
  done
  echo "Это может привести к проблемам с базой данных на Render.com"
fi

# Делаем render-start.sh исполняемым
if [ -f "render-start.sh" ]; then
  echo "Делаем render-start.sh исполняемым..."
  chmod +x render-start.sh
  echo "✓ render-start.sh настроен"
else 
  echo "⚠ render-start.sh не найден - файл будет создан автоматически"
  
  # Создаем render-start.sh если его нет
  echo "Создание render-start.sh..."
  cat > render-start.sh << 'EOL'
#!/bin/bash

# Скрипт для запуска приложения на Render.com
# Исправляет проблемы с базой данных и поддерживает разные типы URL

# Функция для безопасного вывода URL (скрывает пароль)
safe_url() {
  echo "$1" | sed -E 's/:[^@:]*@/:***@/g'
}

echo "===================== FREELANLY APP STARTUP ====================="
echo "Запуск приложения в Render.com"
echo "Дата и время: $(date)"
echo "Версия Node.js: $(node -v)"
echo "==============================================================="

# Определяем тип URL базы данных
if echo "$DATABASE_URL" | grep -q "10\.[0-9]\+\.[0-9]\+\.[0-9]\+"; then
  echo "Обнаружен внутренний URL базы данных Render"
  
  # Исправляем порт для внутренней сети (часто Render использует 443 вместо 5432)
  ORIGINAL_URL=$DATABASE_URL
  export DATABASE_URL=$(echo "$ORIGINAL_URL" | sed -E 's/:[0-9]+\///:5432\//g')
  
  # Проверяем, изменился ли URL
  if [ "$ORIGINAL_URL" != "$DATABASE_URL" ]; then
    echo "Порт в URL базы данных исправлен с 443 на 5432"
  fi
  
  echo "SSL отключен для внутреннего соединения"
else
  echo "Обнаружен внешний URL базы данных"
  
  # Добавляем SSL параметр, если его нет
  if ! echo "$DATABASE_URL" | grep -q "ssl=true" && ! echo "$DATABASE_URL" | grep -q "sslmode=require"; then
    if echo "$DATABASE_URL" | grep -q "\?"; then
      export DATABASE_URL="${DATABASE_URL}&ssl=true"
    else
      export DATABASE_URL="${DATABASE_URL}?ssl=true"
    fi
    echo "Параметр SSL добавлен к URL базы данных"
  fi
fi

echo "Итоговый URL (скрыт пароль): $(safe_url "$DATABASE_URL")"

# Создаем временный конфиг для Drizzle
echo "Создаем конфигурацию для миграции..."
cat > temp-drizzle-config.js << EOL2
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
EOL2

echo "Запуск миграции с временной конфигурацией..."
npx drizzle-kit push:pg --config=temp-drizzle-config.js || echo "Миграция завершилась с ошибками, но мы продолжаем запуск..."
rm temp-drizzle-config.js

echo "==============================================================="
echo "Запуск основного приложения..."
echo "==============================================================="
NODE_ENV=production node dist/index.js
EOL

  chmod +x render-start.sh
  echo "✓ render-start.sh создан и настроен"
fi

echo "✅ Настройка базы данных для Render.com завершена"
echo "   Теперь вы можете запустить сборку проекта: npm run build"
echo "==============================================================="