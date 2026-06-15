import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PrismaClient } from '../generated/prisma/client';

const defaultDatabaseUrl =
  'postgresql://postgres:postgres@localhost:5432/autoprofit?schema=public';

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private clientPromise?: Promise<PrismaClient>;

  async getClient(): Promise<PrismaClient> {
    if (!this.clientPromise) {
      this.clientPromise = this.createClient();
    }

    return this.clientPromise;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.clientPromise) {
      return;
    }

    const client = await this.clientPromise;
    await client.$disconnect();
  }

  private async createClient(): Promise<PrismaClient> {
    const prismaClientModuleUrl = pathToFileURL(
      join(__dirname, '..', 'generated', 'prisma', 'client.js'),
    ).href;
    const prismaClientModule = (await import(
      prismaClientModuleUrl
    )) as typeof import('../generated/prisma/client');
    const { PrismaClient } = prismaClientModule;
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    });

    return new PrismaClient({ adapter });
  }
}
