import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/autoprofit?schema=report',
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/autoprofit_shadow?schema=report',
  },
});
