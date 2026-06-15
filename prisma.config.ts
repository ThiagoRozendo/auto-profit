import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const defaultDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5432/auto_profit?schema=public';

const defaultShadowDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5432/auto_profit_shadow?schema=public';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ?? defaultShadowDatabaseUrl,
  },
});
