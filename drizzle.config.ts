// drizzle.config.ts

import { defineConfig } from "drizzle-kit";

const url = process.env.MIGRATE_DATABASE_URL;
if (!url) {
  throw new Error("MIGRATE_DATABASE_URL must be set for migrations");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url, // берём URL из MIGRATE_DATABASE_URL
    ssl: {
      // отключаем проверку сертификата
      rejectUnauthorized: false,
    },
  },
  ignore: {
    // не трогаем все вьюшки PostgreSQL, начинающиеся с pg_stat_
    views: [/^pg_stat_.*/],
  },
  // только применять миграции, без автоматического удаления объектов
  migrationMode: "apply",
});
