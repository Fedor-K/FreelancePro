#!/bin/bash

# Прямое исправление для Render.com
# Запускать перед npm run build:
# chmod +x fixpostgres.sh && ./fixpostgres.sh

# Примечание: Мы не редактируем drizzle.config.ts напрямую
# Вместо этого, render-start.sh создает временный конфиг
echo "Используем render-start.sh для миграций с корректными настройками"

# Проверяем наличие файла render-start.sh
if [ -f "render-start.sh" ]; then
  echo "Делаем render-start.sh исполняемым..."
  chmod +x render-start.sh
else
  echo "ОШИБКА: Файл render-start.sh не найден!"
  exit 1
fi

echo "Готово! Теперь render-start.sh будет автоматически исправлять URL базы данных при деплое"