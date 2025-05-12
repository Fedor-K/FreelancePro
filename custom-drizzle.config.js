// custom-drizzle.config.js для решения проблемы с pg_stat_statements_info
module.exports = {
  out: "./migrations",
  schema: "./shared/schema.js",  // Обратите внимание на расширение .js вместо .ts
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL,
  },
  // Игнорируем системные вьюшки PostgreSQL
  ignore: {
    views: ["pg_stat_statements_info"],
  },
};