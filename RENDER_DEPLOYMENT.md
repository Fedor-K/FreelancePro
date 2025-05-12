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
| `DATABASE_URL` | `[your database connection string]` | Already configured in your Render.com service |

> **Important**: For `SESSION_SECRET`, use a secure random string. You can generate one with this command:
> ```
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

## Build and Start Commands

Ensure your Render.com service is configured with the following commands:

- **Build Command**: `npm run build`
- **Start Command**: `NODE_ENV=production node dist/index.js`

Альтернативная команда запуска (если вы получаете ошибку Drizzle):
```
NODE_ENV=production node dist/index.js
```

## Troubleshooting Database Errors

If you see an error like this during deployment:

```
error: cannot drop view pg_stat_statements_info because extension pg_stat_statements requires it
```

This is related to the Drizzle ORM migration process and can be safely ignored. The application should still function correctly as long as your database schema is properly set up.

## Note About Authentication

The authentication system in this application has been configured to work correctly in both development and production environments. The changes include:

1. Proper session cookie configuration for secure environments
2. HTTPS-compatible cookie settings
3. Cross-domain support for authentication
4. Improved handling of authentication state in the frontend

If you encounter any authentication issues after deployment, verify that:
- The `SESSION_SECRET` environment variable is set
- `NODE_ENV` is set to `production`
- Your database connection is working properly