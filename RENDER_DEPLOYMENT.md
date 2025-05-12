# Deployment Instructions for Render.com

## Environment Variables Configuration

Configure the following environment variables in the Render.com dashboard:

1. Go to your Render dashboard
2. Navigate to your web service
3. Click on the "Environment" tab
4. Add the following environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets the application to production mode |
| `SESSION_SECRET` | `[generate a random string]` | Secret for session encryption. Use a long random string. |
| `DATABASE_URL` | `[автоматически предоставляется Render]` | Работает как с внутренним URL (10.x.x.x), так и с внешним URL. Формат будет автоматически исправлен если необходимо |

> **Important**: For `SESSION_SECRET`, use a secure random string. You can generate one with this command:
> ```
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

## Build and Start Commands для автоматического деплоя через GitHub

Настройте следующие команды в панели Render.com для вашего сервиса:

- **Build Command**: `npm run build && chmod +x render-start.sh`
- **Start Command**: `./render-start.sh`

### Автоматическое исправление проблем с PostgreSQL

Мы реализовали два уровня исправления проблем:

#### 1. Автоматическое определение и поддержка внутренних и внешних URL Render

В файле `server/db.ts` мы добавили код, который:
- Автоматически определяет, используется ли внутренний URL (10.x.x.x) или внешний URL
- Для внутренних URL: 
  * Исправляет порт на 5432 (вместо 443, который иногда использует Render)
  * Отключает SSL для внутренних соединений
- Для внешних URL: 
  * Добавляет домен `.frankfurt-postgres.render.com` если его нет
  * Добавляет параметр `?ssl=true` для безопасного соединения

```javascript
// Определяем, используется ли внутренний URL Render (10.x.x.x)
const isInternalUrl = connectionString && /\b10\.\d+\.\d+\.\d+\b/.test(connectionString);

if (isInternalUrl) {
  console.log('Обнаружен внутренний URL базы данных Render. Фиксируем порт...');
  // Для внутренних URL принудительно устанавливаем порт 5432
  connectionString = connectionString.replace(/:[0-9]+\//, ':5432/');
  // Показываем безопасную версию URL (без пароля)
  console.log('URL после исправления порта:', connectionString.replace(/:[^@:]*@/, ':***@'));
} else if (connectionString && connectionString.includes('dpg-') && !connectionString.includes('.postgres.render.com')) {
  console.log('Обнаружен внешний URL базы данных Render без полного домена. Исправляем...');
  
  // Исправляем URL для внешнего доступа...
}

// Включаем SSL только для внешних подключений
ssl: !isInternalUrl
```

#### 2. Безопасные миграции и исправление порта в render-start.sh

Скрипт `render-start.sh` выполняет следующие действия при запуске:
- Определяет тип URL базы данных (внутренний или внешний)
- Для внутренних URL исправляет порт с 443 на 5432
- Для внешних URL добавляет домен и параметр SSL
- Создает временный конфиг для Drizzle, игнорирующий системные представления PostgreSQL
- Запускает миграции с безопасными настройками
- Продолжает работу даже при ошибках миграции
- Автоматически запускает основное приложение после всех настроек

**Вам не нужно ничего настраивать вручную!** Всё будет работать автоматически.

## Troubleshooting Database Errors

### Common Database Connection Errors

If you see an error like this during deployment:

```
error: cannot drop view pg_stat_statements_info because extension pg_stat_statements requires it
```

This is related to the Drizzle ORM migration process and can be safely ignored. The application should still function correctly as long as your database schema is properly set up.

### Neon PostgreSQL WebSocket Connection Issues

If you encounter WebSocket connection errors with Neon PostgreSQL, check the following:

1. Verify that your DATABASE_URL environment variable is correctly formatted
2. Make sure that the Neon PostgreSQL project allows connections from your Render instance's IP range
3. Check that your database has the necessary extensions enabled

We've improved the database connection reliability with the following enhancements:

1. Added additional error handling for connection issues
2. Implemented proper WebSocket configuration for Neon PostgreSQL
3. Enhanced SSL/TLS settings for secure database connections
4. Added detailed error logging for better troubleshooting

## Note About Authentication

The authentication system in this application has been configured to work correctly in both development and production environments. The changes include:

1. Proper session cookie configuration for secure environments
2. HTTPS-compatible cookie settings
3. Cross-domain support for authentication
4. Improved handling of authentication state in the frontend
5. Enhanced error handling during login/registration processes
6. Better client-side error messages for authentication issues

If you encounter any authentication issues after deployment, verify that:
- The `SESSION_SECRET` environment variable is set
- `NODE_ENV` is set to `production`
- Your database connection is working properly

### Debugging Authentication Problems

If users cannot log in or register, check the following:

1. Examine server logs for detailed error messages about database connection issues
2. Verify that session cookies are being correctly set (check browser developer tools)
3. Make sure the Render.com service has the correct environment variables
4. Check that the database tables for users and sessions have been properly created

## Client-Side Error Handling Improvements

We've enhanced error handling throughout the application to:

1. Display more helpful error messages to users
2. Better handle network connection issues
3. Provide detailed error information during form validation
4. Add robust error recovery for most common failure scenarios

## Database Connection Monitoring 

The application now includes basic database connection monitoring:

1. Connection status is logged during server startup
2. Connection errors are captured with detailed information
3. Automatic retry capability for temporary connection issues
4. Better user feedback for database-related errors

## Исправление проблем с подключением к PostgreSQL на Render

Если вы видите ошибку "connect ECONNREFUSED" при подключении к базе данных на Render, выполните следующие действия:

### 1. Определите, какой тип URL вы используете

Render предоставляет два типа URL для доступа к базе данных:

#### Внутренний URL (для сервисов в одном регионе)
```
postgres://username:password@10.x.x.x:5432/dbname
```
Такой URL используется для подключения между сервисами Render через приватную сеть. Наше приложение автоматически распознает такие URL и настраивает соединение без SSL.

#### Внешний URL (для доступа извне)
```
postgres://username:password@hostname.region-postgres.render.com/dbname?ssl=true
```

Например:
```
postgres://freelanly_user:password@dpg-d0gb52juibrs73feqcd0-a.frankfurt-postgres.render.com/freelanly?ssl=true
```

### 2. Подключение работает автоматически с обоими типами URL

Наше приложение теперь автоматически определяет тип URL и настраивает соединение соответствующим образом:

- Для **внутренних URL** с IP-адресами (10.x.x.x): 
  * Исправляет порт на 5432 (вместо 443, который иногда использует Render)
  * Отключает SSL для внутренних соединений
- Для **внешних URL**: 
  * Автоматически добавляет доменную часть региона
  * Включает SSL для безопасного соединения

Поэтому вам **не нужно вручную изменять URL**, приложение сделает это автоматически!

### 2. Проверьте настройки в Render Dashboard

Убедитесь, что в настройках вашего сервиса на Render.com указан правильный формат DATABASE_URL:

1. Перейдите в Dashboard Render
2. Выберите ваш сервис
3. Перейдите на вкладку "Environment"
4. Проверьте, что DATABASE_URL содержит полное доменное имя с расширением `.region-postgres.render.com`
5. Убедитесь, что URL содержит параметр `?ssl=true`

### 3. Проверьте подключение вручную

Для проверки подключения к базе данных можно использовать следующую команду:

```bash
psql "postgres://username:password@hostname.region-postgres.render.com/dbname?ssl=true"
```

### 4. Обновите настройки базы данных на Neon Dashboard

Если ничего не помогает, проверьте настройки в панели управления Neon PostgreSQL:

1. Перейдите на dashboard.neon.tech
2. Выберите ваш проект
3. Проверьте настройки подключения и разрешенные IP-адреса
4. Убедитесь, что ваш проект не находится в режиме ожидания (спящем режиме)