// drizzle.config.ts

import { defineConfig } from "drizzle-kit";

// Отключаем проверку самоподписанных сертификатов для Drizzle-миграций
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const url = process.env.MIGRATE_DATABASE_URL;
if (!url) {
  throw new Error("MIGRATE_DATABASE_URL must be set for migrations");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url, // используем TCP-URL с портом 5432 и sslmode=require
  },
  ignore: {
    // не трогаем системные вьюшки pg_stat_*
    views: [/^pg_stat_.*/],
  },
  // только применяем миграции, без автоматического удаления «лишних» объектов
  migrationMode: "apply",
});
