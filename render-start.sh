#!/bin/bash

# Скрипт для запуска приложения на Render.com
# Исправляет проблемы с базой данных и миграциями

# Выводим информацию о типе URL базы данных
if echo "$DATABASE_URL" | grep -q "10\.[0-9]\+\.[0-9]\+\.[0-9]\+"; then
  echo "Обнаружен внутренний URL базы данных Render. Фиксируем порт..."

  # Исправляем порт для внутренней сети (часто Render использует 443 вместо 5432)
  # Используем временную переменную чтобы не показывать пароль при отладке
  TEMP_URL=$DATABASE_URL
  
  # Применяем регулярное выражение для замены порта
  export DATABASE_URL=$(echo "$TEMP_URL" | sed -E 's/:[0-9]+\///:5432\//g')
  
  # Выводим безопасную версию URL (скрываем пароль)
  SAFE_URL=$(echo "$DATABASE_URL" | sed -E 's/:[^@:]*@/:***@/g')
  echo "URL после исправления порта: $SAFE_URL"

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

# Запускаем безопасную миграцию с помощью специального скрипта
echo "Запуск безопасной миграции базы данных..."
NODE_ENV=production node drizzle-push-safe.js

# 4. Запускаем основное приложение
echo "Запуск основного приложения..."
NODE_ENV=production node dist/index.js