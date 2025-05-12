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
| `DATABASE_URL` | `[internal database URL]` | **Use the Internal Database URL** from Render.com PostgreSQL dashboard |

> **Important**: For `SESSION_SECRET`, use a secure random string. You can generate one with this command:
> ```
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

## Build and Start Commands

Ensure your Render.com service is configured with the following commands:

- **Build Command**: `npm run build`
- **Start Command**: `NODE_ENV=production node dist/index.js`

Мы рекомендуем использовать эту команду запуска вместо команды с Drizzle, так как она более стабильна:

## Database Configuration

### Important: Use Internal Database URL

For best performance and security, always use the **Internal Database URL** for your Render PostgreSQL database when your web service is also hosted on Render. This URL looks like:

```
postgresql://username:password@database-internal-address/database_name
```

### SSL Configuration

The application is configured to work with Render's PostgreSQL SSL certificates. In production mode, SSL is enabled but set to allow self-signed certificates, which is necessary for Render's database service.

### Troubleshooting Database Errors

If you see errors like these during deployment:

```
error: cannot drop view pg_stat_statements_info because extension pg_stat_statements requires it
```

```
Error: self-signed certificate
```

These are related to the Drizzle ORM migration process and SSL certificates. They can be safely ignored. The application is configured to handle these issues automatically.

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